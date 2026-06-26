using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace CMS.Backend.Controllers
{
    // ==========================
    // ADMIN MVC CRUD
    // ==========================

    [Authorize]
    public class CategoryProductController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CategoryProductController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public IActionResult Index(int page = 1)
        {
            int pageSize = 10;
            var query = _context.CategoriesProducts.AsQueryable();

            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var data = query
                .OrderByDescending(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.Page = page;
            ViewBag.TotalPages = totalPages;

            return View(data);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(CategoryProduct model, IFormFile? uploadImage)
        {
            if (!ModelState.IsValid)
                return View(model);

            if (uploadImage != null)
            {
                string fileName = Guid.NewGuid().ToString()
                                  + Path.GetExtension(uploadImage.FileName);

                string uploadFolder = Path.Combine(
                    _env.WebRootPath, "images"
                );

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                string filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    uploadImage.CopyTo(stream);
                }

                model.ImageUrl = fileName;
            }

            _context.CategoriesProducts.Add(model);
            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var category = _context.CategoriesProducts.Find(id);
            if (category == null) return NotFound();
            return View(category);
        }

        [HttpPost]
        public IActionResult Edit(CategoryProduct model, IFormFile? uploadImage)
        {
            if (!ModelState.IsValid)
                return View(model);

            var existing = _context.CategoriesProducts.Find(model.Id);
            if (existing == null) return NotFound();

            existing.Name = model.Name;
            existing.Description = model.Description;

            if (uploadImage != null)
            {
                string fileName = Guid.NewGuid().ToString()
                                  + Path.GetExtension(uploadImage.FileName);

                string uploadFolder = Path.Combine(
                    _env.WebRootPath, "images"
                );

                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder);

                string filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    uploadImage.CopyTo(stream);
                }

                existing.ImageUrl = fileName;
            }

            _context.SaveChanges();
            return RedirectToAction("Index");
        }

        public IActionResult Delete(int id)
        {
            var category = _context.CategoriesProducts.Find(id);
            if (category != null)
            {
                _context.CategoriesProducts.Remove(category);
                _context.SaveChanges();
            }
            return RedirectToAction("Index");
        }
    }
}
