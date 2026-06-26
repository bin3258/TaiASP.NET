using CMS.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    public class OrderController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Danh sách đơn hàng
        public IActionResult Index(int page = 1)
        {
            int pageSize = 10;
            var query = _context.Orders
                .Include(x => x.Customer)
                .AsQueryable();

            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var orders = query
                .OrderByDescending(x => x.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.Page = page;
            ViewBag.TotalPages = totalPages;

            return View(orders);
        }

        // Chi tiết đơn hàng
        [HttpGet]
        public IActionResult Detail(int id)
        {
            var order = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(d => d.Product)
                .FirstOrDefault(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            ViewBag.WarehouseList = _context.Warehouses
                .Where(w => w.Status)
                .ToList();

            return View(order);
        }


        [HttpPost]
        public IActionResult Confirm(int id, Dictionary<int, int> warehouses)
        {
            var order = _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefault(o => o.Id == id);

            if (order == null)
                return NotFound();

            if (order.Status != 0)
            {
                TempData["Error"] = "Đơn hàng đã được xử lý!";
                return RedirectToAction("Detail", new { id });
            }

            foreach (var detail in order.OrderDetails)
            {
                if (warehouses.TryGetValue(detail.Id, out int warehouseId))
                {
                    detail.WarehouseId = warehouseId;

                    // Trừ tồn kho trong ProductWarehouse
                    var pw = _context.ProductWarehouses
                        .FirstOrDefault(x => x.ProductId == detail.ProductId && x.WarehouseId == warehouseId);

                    if (pw != null)
                    {
                        if (pw.StockQuantity < detail.Quantity)
                        {
                            TempData["Error"] = $"Sản phẩm {detail.Product?.Name} không đủ tồn ở kho đã chọn!";
                            return RedirectToAction("Detail", new { id });
                        }
                        pw.StockQuantity -= detail.Quantity;
                    }

                    // Cập nhật tổng tồn kho của sản phẩm
                    var product = _context.Products.Find(detail.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity = _context.ProductWarehouses
                            .Where(x => x.ProductId == detail.ProductId)
                            .Sum(x => x.StockQuantity);
                    }
                }
                else
                {
                    TempData["Error"] = "Vui lòng chọn kho xuất cho tất cả sản phẩm!";
                    return RedirectToAction("Detail", new { id });
                }
            }

            order.Status = 1;
            _context.SaveChanges();

            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Shipping(int id)
        {
            var order = _context.Orders.Find(id);

            if (order == null)
                return NotFound();

            order.Status = 2;

            _context.SaveChanges();

            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Delivered(int id)
        {
            var order = _context.Orders.Find(id);

            if (order == null)
                return NotFound();

            order.Status = 3;

            _context.SaveChanges();

            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Cancel(int id)
        {
            var order = _context.Orders.Find(id);

            if (order == null)
                return NotFound();

            order.Status = 4;

            // hoàn kho

            var details = _context.OrderDetails
                .Where(x => x.OrderId == order.Id)
                .ToList();

            foreach (var item in details)
            {
                if (item.WarehouseId != null)
                {
                    var pw = _context.ProductWarehouses
                        .FirstOrDefault(x => x.ProductId == item.ProductId && x.WarehouseId == item.WarehouseId);

                    if (pw != null)
                    {
                        pw.StockQuantity += item.Quantity;
                    }

                    var product = _context.Products.Find(item.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity = _context.ProductWarehouses
                            .Where(x => x.ProductId == item.ProductId)
                            .Sum(x => x.StockQuantity);
                    }
                }
                else
                {
                    var product = _context.Products.Find(item.ProductId);
                    if (product != null)
                    {
                        product.StockQuantity += item.Quantity;
                    }
                }
            }

            _context.SaveChanges();

            return RedirectToAction("Index");
        }
    }
}