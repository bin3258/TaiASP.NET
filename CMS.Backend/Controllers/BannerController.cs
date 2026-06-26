using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class BannerController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BannerController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: /Banner
        public async Task<IActionResult> Index(int page = 1)
        {
            int pageSize = 10;
            var query = _context.Banners.AsQueryable();

            int totalItems = await query.CountAsync();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var list = await query
                .OrderBy(b => b.DisplayOrder)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.Page = page;
            ViewBag.TotalPages = totalPages;

            return View(list);
        }

        // GET: /Banner/Create
        [HttpGet]
        public IActionResult Create()
        {
            return View(new Banner());
        }

        // POST: /Banner/Create
        [HttpPost]
        public async Task<IActionResult> Create( Banner model,IFormFile? imageFile)
            {
            if (!ModelState.IsValid) return View(model);

            // xử lý file ảnh
            if (imageFile != null && imageFile.Length > 0)
            {
                model.ImageUrl = await SaveBannerImageAsync(imageFile);
            }

            // Nếu client gửi DisplayOrder >= 0 => chèn vào vị trí đó (đẩy các banner >= vị trí lên 1)
            if (model.DisplayOrder >= 0)
            {
                await ShiftOrdersForInsertAsync(model.DisplayOrder);
            }
            else
            {
                var maxOrder = await _context.Banners.MaxAsync(b => (int?)b.DisplayOrder) ?? -1;
                model.DisplayOrder = maxOrder + 1;
            }

            model.CreatedAt = DateTime.UtcNow;

            _context.Banners.Add(model);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }

        // GET: /Banner/Edit/5
        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();
            return View(banner);
        }

        // POST: /Banner/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id,IFormFile? imageFile,int? displayOrder)
        {
            // Lấy entity từ DB (quan trọng)
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();

            // Cập nhật các trường cho phép một cách an toàn
            // Tham số prefix "" vì chúng gửi trực tiếp các trường trong form
            var updateSucceeded = await TryUpdateModelAsync<Banner>(
                banner,
                "",
                b => b.Title,
                b => b.Description,
                b => b.IsActive
            );

            if (!updateSucceeded)
            {
                // Nếu khởi tạo model không thành công, trả view với entity hiện tại (có validation)
                return View(banner);
            }

            // Xử lý upload ảnh mới (nếu user chọn file)
            if (imageFile != null && imageFile.Length > 0)
            {
                // Xóa file cũ an toàn (nếu có)
                if (!string.IsNullOrEmpty(banner.ImageUrl))
                {
                    DeleteBannerImage(banner.ImageUrl);
                }

                banner.ImageUrl = await SaveBannerImageAsync(imageFile);
            }

            // Xử lý thứ tự hiển thị: nếu client gửi displayOrder (optional) và khác với cũ
            if (displayOrder.HasValue)
            {
                var newOrder = Math.Max(0, displayOrder.Value);
                var oldOrder = banner.DisplayOrder;
                if (newOrder != oldOrder)
                {
                    await ShiftOrdersForUpdateAsync(oldOrder, newOrder);
                    banner.DisplayOrder = newOrder;
                }
            }
            // nếu displayOrder == null => giữ nguyên

            banner.UpdatedAt = DateTime.UtcNow;

            try
            {
                _context.Banners.Update(banner);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Xử lý concurrency nếu cần
                if (!await _context.Banners.AnyAsync(x => x.Id == id))
                    return NotFound();
                throw;
            }

            // Sau lưu redirect về Index
            return RedirectToAction(nameof(Index));
        }

        // POST: /Banner/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();

            // xóa file ảnh trên đĩa nếu có
            if (!string.IsNullOrEmpty(banner.ImageUrl))
            {
                DeleteBannerImage(banner.ImageUrl);
            }

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();

            // Normalize display order
            var all = await _context.Banners.OrderBy(b => b.DisplayOrder).ToListAsync();
            for (int i = 0; i < all.Count; i++) all[i].DisplayOrder = i;
            _context.Banners.UpdateRange(all);
            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(Index));
        }

        // POST: /Banner/MoveUp/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MoveUp(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();

            if (banner.DisplayOrder <= 0) return RedirectToAction(nameof(Index));

            var prev = await _context.Banners
                .Where(b => b.DisplayOrder == banner.DisplayOrder - 1)
                .FirstOrDefaultAsync();

            if (prev != null)
            {
                prev.DisplayOrder++;
                banner.DisplayOrder--;
                _context.Banners.UpdateRange(prev, banner);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: /Banner/MoveDown/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MoveDown(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound();

            var maxOrder = await _context.Banners.MaxAsync(b => b.DisplayOrder);
            if (banner.DisplayOrder >= maxOrder) return RedirectToAction(nameof(Index));

            var next = await _context.Banners
                .Where(b => b.DisplayOrder == banner.DisplayOrder + 1)
                .FirstOrDefaultAsync();

            if (next != null)
            {
                next.DisplayOrder--;
                banner.DisplayOrder++;
                _context.Banners.UpdateRange(next, banner);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction(nameof(Index));
        }

        // POST: /Banner/Reorder
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Reorder([FromBody] int[] orderedIds)
        {
            if (orderedIds == null || orderedIds.Length == 0)
                return BadRequest("orderedIds required");

            var banners = await _context.Banners
                .Where(b => orderedIds.Contains(b.Id))
                .ToListAsync();

            if (banners.Count != orderedIds.Length)
                return BadRequest("Invalid banner id list.");

            for (int i = 0; i < orderedIds.Length; i++)
            {
                var id = orderedIds[i];
                var banner = banners.First(x => x.Id == id);
                banner.DisplayOrder = i;
            }

            _context.Banners.UpdateRange(banners);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Helper: lưu ảnh, trả đường dẫn tương đối để lưu vào DB (vd: /images/banners/xxxxx.jpg)
        private async Task<string> SaveBannerImageAsync(IFormFile file)
        {
            var uploads = Path.Combine(_env.WebRootPath, "images", "banners");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

            var ext = Path.GetExtension(file.FileName);
            // tạo tên file an toàn
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploads, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // trả đường dẫn tương đối dùng trong <img src="...">
            return $"/images/banners/{fileName}";
        }

        // Helper: xóa file ảnh cũ
        private void DeleteBannerImage(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl)) return;
                // imageUrl kiểu "/images/banners/xxxx.jpg" hoặc "images/banners/xxxx.jpg"
                var relative = imageUrl.TrimStart('/');
                var fullPath = Path.Combine(_env.WebRootPath, relative.Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }
            catch
            {
                // im lặng nếu xóa thất bại
            }
        }

        // Helper: chèn một banner mới vào vị trí newOrder, tăng tất cả banner có DisplayOrder >= newOrder lên 1
        private async Task ShiftOrdersForInsertAsync(int newOrder)
        {
            var affected = await _context.Banners
                .Where(b => b.DisplayOrder >= newOrder)
                .ToListAsync();

            if (affected.Any())
            {
                foreach (var b in affected) b.DisplayOrder = b.DisplayOrder + 1;
                _context.Banners.UpdateRange(affected);
                await _context.SaveChangesAsync();
            }
        }

        // Helper: cập nhật thứ tự khi di chuyển từ oldOrder -> newOrder
        private async Task ShiftOrdersForUpdateAsync(int oldOrder, int newOrder)
        {
            if (newOrder == oldOrder) return;

            if (newOrder < oldOrder)
            {
                // di chuyển lên: tăng tất cả banner có DisplayOrder trong [newOrder, oldOrder-1] lên 1
                var affected = await _context.Banners
                    .Where(b => b.DisplayOrder >= newOrder && b.DisplayOrder < oldOrder)
                    .ToListAsync();

                foreach (var b in affected) b.DisplayOrder = b.DisplayOrder + 1;
                _context.Banners.UpdateRange(affected);
                await _context.SaveChangesAsync();
            }
            else
            {
                // di chuyển xuống: giảm tất cả banner có DisplayOrder trong (oldOrder, newOrder] xuống 1
                var affected = await _context.Banners
                    .Where(b => b.DisplayOrder > oldOrder && b.DisplayOrder <= newOrder)
                    .ToListAsync();

                foreach (var b in affected) b.DisplayOrder = b.DisplayOrder - 1;
                _context.Banners.UpdateRange(affected);
                await _context.SaveChangesAsync();
            }
        }
    }
}