using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    public class OrderDetailController : Controller
    {
        private readonly ApplicationDbContext _context;

        // Inject DbContext
        public OrderDetailController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Hiển thị danh sách chi tiết đơn hàng
        public IActionResult Index()
        {
            // Lấy dữ liệu thật từ SQL Server
            var orderDetails = _context.OrderDetails.ToList();

            return View(orderDetails);
        }
    }
}