using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    public class CategoryProductController : Controller
    {
        private readonly ApplicationDbContext _context;

        // Inject DbContext
        public CategoryProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Hiển thị danh sách danh mục sản phẩm
        public IActionResult Index()
        {
            // Lấy dữ liệu thật từ SQL
            var data = _context.CategoriesProducts.ToList();

            return View(data);
        }
    }
}