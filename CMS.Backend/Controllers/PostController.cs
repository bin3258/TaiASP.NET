using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Authorize]
    public class PostController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PostController(ApplicationDbContext context)
        {
            _context = context;
        }

        // SỬA TẠI ĐÂY: Cho phép id bằng null để hiển thị tất cả bài viết từ menu Sidebar
        public IActionResult Index(int? id, int page = 1)
        {
            int pageSize = 10;
            var query = _context.Posts
                .Include(p => p.Category)
                .AsQueryable();

            if (id != null && id != 0)
            {
                query = query.Where(p => p.CategoryId == id);
                ViewBag.CurrentCategoryId = id;
            }
            else
            {
                ViewBag.CurrentCategoryId = null;
            }

            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var posts = query
                .OrderByDescending(p => p.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.Page = page;
            ViewBag.TotalPages = totalPages;

            return View(posts);
        }

        // GET: Post/Details/5
        public IActionResult Details(int id)
        {
            var post = _context.Posts
                .Include(p => p.Category)
                .FirstOrDefault(p => p.Id == id);

            if (post == null)
            {
                return NotFound();
            }

            ViewBag.CategoryId = post.CategoryId;
            return View(post);
        }

        // GET: Post/Create
        [HttpGet]
        public IActionResult Create()
        {
            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name");
            return View();
        }

        // POST: Post/Create
        [HttpPost]
        public IActionResult Create(Post model, IFormFile uploadImage)
        {
            ModelState.Remove("uploadImage");
            ModelState.Remove("ImageUrl");
            ModelState.Remove("Category");
            ModelState.Remove("CreatedDate");

            if (string.IsNullOrEmpty(model.Title))
            {
                ModelState.AddModelError("Title", "Vui lòng nhập tiêu đề bài viết.");
            }
            if (string.IsNullOrEmpty(model.Content))
            {
                ModelState.AddModelError("Content", "Vui lòng nhập nội dung chi tiết.");
            }
            if (model.CategoryId == 0)
            {
                ModelState.AddModelError("CategoryId", "Vui lòng chọn chuyên mục.");
            }

            if (ModelState.IsValid)
            {
                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        uploadImage.CopyTo(stream);
                    }

                    model.ImageUrl = fileName;
                }
                else
                {
                    model.ImageUrl = "default-thumbnail.jpg";
                }

                model.CreatedDate = DateTime.Now;
                model.Category = null;

                _context.Posts.Add(model);
                _context.SaveChanges();

                return RedirectToAction("Index");
            }

            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", model.CategoryId);
            return View(model);
        }

        // GET: Post/Edit/5
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var post = _context.Posts.AsNoTracking().FirstOrDefault(p => p.Id == id);
            if (post == null) return NotFound();

            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", post.CategoryId);
            return View(post);
        }

        // POST: Post/Edit/5
        [HttpPost]
        public IActionResult Edit(Post model, IFormFile uploadImage)
        {
            ModelState.Remove("uploadImage");
            ModelState.Remove("ImageUrl");
            ModelState.Remove("Category");
            ModelState.Remove("CreatedDate");

            if (ModelState.IsValid)
            {
                var oldPost = _context.Posts.AsNoTracking().FirstOrDefault(p => p.Id == model.Id);

                if (uploadImage != null && uploadImage.Length > 0)
                {
                    string folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                    if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(uploadImage.FileName);
                    string filePath = Path.Combine(folder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        uploadImage.CopyTo(stream);
                    }

                    model.ImageUrl = fileName;
                }
                else
                {
                    if (oldPost != null)
                    {
                        model.ImageUrl = oldPost.ImageUrl;
                    }
                }

                if (oldPost != null)
                {
                    model.CreatedDate = oldPost.CreatedDate;
                }
                else
                {
                    model.CreatedDate = DateTime.Now;
                }

                model.Category = null;

                _context.Posts.Update(model);
                _context.SaveChanges();

                return RedirectToAction("Index");
            }

            ViewBag.CategoryList = new SelectList(_context.Categories, "Id", "Name", model.CategoryId);
            return View(model);
        }

        // DELETE: Post/Delete/5
        public IActionResult Delete(int id)
        {
            var post = _context.Posts.Find(id);
            if (post != null)
            {
                _context.Posts.Remove(post);
                _context.SaveChanges();

                return RedirectToAction("Index");
            }
            return RedirectToAction("Index");
        }
    }
}