using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ======================================
        // LẤY THÔNG TIN KHÁCH HÀNG
        // GET: api/Customers/Profile/1
        // ======================================

        [HttpGet("Profile/{customerId}")]
        public IActionResult GetProfile(int customerId)
        {
            var customer = _context.Customers
                .Where(x => x.Id == customerId)
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.Email,
                    x.Phone,
                    x.Address
                })
                .FirstOrDefault();

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            return Ok(customer);
        }

        // ======================================
        // CẬP NHẬT THÔNG TIN
        // PUT: api/Customers/Profile/1
        // ======================================

        [HttpPut("Profile/{customerId}")]
        public IActionResult UpdateProfile(
            int customerId,
            [FromBody] UpdateProfileRequest request)
        {
            var customer = _context.Customers.Find(customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            customer.FullName = request.FullName;
            customer.Phone = request.Phone;
            customer.Address = request.Address;

            _context.SaveChanges();

            return Ok(new
            {
                message = "Cập nhật thông tin thành công"
            });
        }

        // ======================================
        // ĐỔI MẬT KHẨU
        // PUT: api/Customers/ChangePassword/1
        // ======================================

        [HttpPut("ChangePassword/{customerId}")]
        public IActionResult ChangePassword(
            int customerId,
            [FromBody] ChangePasswordRequest request)
        {
            var customer = _context.Customers.Find(customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, customer.Password))
            {
                return BadRequest(new
                {
                    message = "Mật khẩu cũ không đúng"
                });
            }

            customer.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Đổi mật khẩu thành công"
            });
        }

        // ======================================
        // XÓA TÀI KHOẢN
        // DELETE: api/Customers/DeleteAccount/1
        // ======================================

        [HttpDelete("DeleteAccount/{customerId}")]
        public IActionResult DeleteAccount(int customerId)
        {
            var customer = _context.Customers.Find(customerId);

            if (customer == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            bool hasProcessingOrder = _context.Orders
                .Any(x =>
                    x.CustomerId == customerId &&
                    (x.Status == 0 ||
                     x.Status == 1 ||
                     x.Status == 2));

            if (hasProcessingOrder)
            {
                return BadRequest(new
                {
                    message = "Bạn đang có đơn hàng đang xử lý, không thể xóa tài khoản"
                });
            }

            _context.Customers.Remove(customer);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Xóa tài khoản thành công"
            });
        }

        // ======================================
        // LỊCH SỬ MUA HÀNG
        // GET: api/Customers/Orders/1
        // ======================================

        [HttpGet("Orders/{customerId}")]
        public IActionResult GetOrders(int customerId)
        {
            var customerExists = _context.Customers.Any(x => x.Id == customerId);

            if (!customerExists)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy khách hàng"
                });
            }

            var orders = _context.Orders
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.OrderDate)
                .Select(x => new
                {
                    x.Id,
                    x.OrderDate,
                    x.Status,
                    x.Notes,
                    Total = x.OrderDetails.Sum(d => d.Quantity * d.UnitPrice),
                    ProductCount = x.OrderDetails.Count
                })
                .ToList();

            return Ok(orders);
        }

        // ======================================
        // CHI TIẾT ĐƠN HÀNG
        // GET: api/Customers/OrderDetail/5
        // ======================================

        [HttpGet("OrderDetail/{orderId}")]
        public IActionResult GetOrderDetail(int orderId)
        {
            var order = _context.Orders
                .Include(x => x.OrderDetails)
                .ThenInclude(x => x.Product)
                .FirstOrDefault(x => x.Id == orderId);

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng"
                });
            }

            var result = new
            {
                order.Id,
                order.OrderDate,
                order.Status,
                order.Notes,

                Products = order.OrderDetails.Select(x => new
                {
                    x.ProductId,
                    ProductName = x.Product.Name,
                    ImageUrl = x.Product.ImageUrl,
                    x.Quantity,
                    x.UnitPrice,
                    Total = x.Quantity * x.UnitPrice
                })
            };

            return Ok(result);
        }
    }

    // ======================================
    // DTO
    // ======================================

    public class UpdateProfileRequest
    {
        public string FullName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}