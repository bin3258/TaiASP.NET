using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;

        // Inject DbContext
        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Hiển thị danh sách khách hàng
        public IActionResult Index()
        {
            // Lấy dữ liệu thật từ SQL
            var customers = _context.Customers.ToList();

            return View(customers);
        }
    }
}