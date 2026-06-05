using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CMS.Backend.Controllers
{
    public class ProductController : Controller
    {
        private readonly ApplicationDbContext _context;

        // Inject DbContext
        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Hiển thị danh sách sản phẩm
        public IActionResult Index()
        {
            // Lấy dữ liệu thật từ SQL Server
            var products = _context.Products.ToList();

            return View(products);
        }

        [HttpGet]
        public IActionResult Create()
        {
            ViewBag.CategoryProductList = new SelectList(
                _context.CategoriesProducts.ToList(),
                "Id",
                "Name"
            );

            return View();
        }
        [HttpPost]
        public IActionResult Create(Product product, IFormFile? uploadImage)
        {
            if (ModelState.IsValid)
            {
                // Upload ảnh
                if (uploadImage != null)
                {
                    string fileName = Guid.NewGuid().ToString()
                                      + Path.GetExtension(uploadImage.FileName);

                    string uploadFolder = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot/images/"
                    );

                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }

                    string filePath = Path.Combine(uploadFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        uploadImage.CopyTo(stream);
                    }

                    product.ImageUrl = fileName;
                }

                _context.Products.Add(product);
                _context.SaveChanges();

                return RedirectToAction("Index");
            }

            ViewBag.CategoryProductList = new SelectList(
                _context.CategoriesProducts.ToList(),
                "Id",
                "Name"
            );

            return View(product);
        }
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var product = _context.Products.Find(id);

            if (product == null)
            {
                return NotFound();
            }

            ViewBag.CategoryProductList = new SelectList(
                _context.CategoriesProducts.ToList(),
                "Id",
                "Name",
                product.CategoryProductId
            );

            return View(product);
        }
        [HttpPost]
        public IActionResult Edit(Product product, IFormFile? uploadImage)
        {
            if (ModelState.IsValid)
            {
                var oldProduct = _context.Products.Find(product.Id);

                if (oldProduct == null)
                {
                    return NotFound();
                }

                oldProduct.Name = product.Name;
                oldProduct.Description = product.Description;
                oldProduct.Price = product.Price;
                oldProduct.StockQuantity = product.StockQuantity;
                oldProduct.CategoryProductId = product.CategoryProductId;

                if (uploadImage != null)
                {
                    string fileName = Guid.NewGuid().ToString()
                                      + Path.GetExtension(uploadImage.FileName);

                    string uploadFolder = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot/images/"
                    );

                    if (!Directory.Exists(uploadFolder))
                    {
                        Directory.CreateDirectory(uploadFolder);
                    }

                    string filePath = Path.Combine(uploadFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        uploadImage.CopyTo(stream);
                    }

                    oldProduct.ImageUrl = fileName;
                }

                _context.SaveChanges();

                return RedirectToAction("Index");
            }

            ViewBag.CategoryProductList = new SelectList(
                _context.CategoriesProducts.ToList(),
                "Id",
                "Name"
            );

            return View(product);
        }
        [HttpGet]
        public IActionResult Delete(int id)
        {
            var product = _context.Products.Find(id);

            if (product == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                string imagePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/images/products",
                    product.ImageUrl
                );

                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Products.Remove(product);

            _context.SaveChanges();

            return RedirectToAction("Index");
        }
    }
}