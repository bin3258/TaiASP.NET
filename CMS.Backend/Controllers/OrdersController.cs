using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ==========================
        // CLASS NHẬN DỮ LIỆU TỪ REACT
        // ==========================

        public class OrderItem
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
        }

        public class CreateOrderRequest
        {
            public int CustomerId { get; set; }

            public string? Notes { get; set; }

            public List<OrderItem> Items { get; set; }
        }

        // ==================================
        // POST: api/Orders
        // ĐẶT HÀNG
        // ==================================

        [HttpPost]
        public IActionResult CreateOrder(CreateOrderRequest request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                return BadRequest(new
                {
                    message = "Giỏ hàng đang trống"
                });
            }

            var order = new Order
            {
                CustomerId = request.CustomerId,
                OrderDate = DateTime.Now,
                Status = 0,
                Notes = request.Notes
            };

            _context.Orders.Add(order);
            _context.SaveChanges();

            foreach (var item in request.Items)
            {
                var product = _context.Products
                    .FirstOrDefault(p => p.Id == item.ProductId);

                if (product == null)
                {
                    continue;
                }

                if (product.StockQuantity < item.Quantity)
                {
                    return BadRequest(new
                    {
                        message = $"Sản phẩm {product.Name} không đủ số lượng tồn kho"
                    });
                }

                var detail = new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                };

                _context.OrderDetails.Add(detail);

                // Trừ tồn kho
                product.StockQuantity -= item.Quantity;
            }

            _context.SaveChanges();

            return Ok(new
            {
                message = "Đặt hàng thành công",
                orderId = order.Id
            });
        }

        // ==================================
        // GET: api/Orders/customer/{customerId}
        // LỊCH SỬ MUA HÀNG
        // ==================================

        [HttpGet("customer/{customerId}")]
        public IActionResult GetOrdersByCustomer(int customerId)
        {
            var orders = _context.Orders
                .Where(o => o.CustomerId == customerId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.Id,
                    o.OrderDate,
                    o.Status,
                    o.Notes
                })
                .ToList();

            return Ok(orders);
        }
    }
}