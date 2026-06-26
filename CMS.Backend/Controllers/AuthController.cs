using CMS.Data;
using CMS.Data.Entities;
using CMS.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // POST: api/Auth/Register
        [HttpPost("Register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            var usernameExists = _context.Users
                .Any(x => x.Username == request.Username);

            if (usernameExists)
            {
                return BadRequest(new
                {
                    message = "Tên đăng nhập đã tồn tại"
                });
            }

            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                Role = "Customer"
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Đăng ký thành công",
                userId = user.Id
            });
        }

        // POST: api/Auth/Login
        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users
                .FirstOrDefault(x => x.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new
                {
                    message = "Tên đăng nhập hoặc mật khẩu không đúng"
                });
            }

            return Ok(new
            {
                userId = user.Id,
                username = user.Username,
                fullName = user.FullName,
                role = user.Role
            });
        }

        // POST: api/Auth/CustomerRegister
        [HttpPost("CustomerRegister")]
        public IActionResult CustomerRegister([FromBody] CustomerRegisterRequest request)
        {
            var emailExists = _context.Customers
                .Any(x => x.Email == request.Email);

            if (emailExists)
            {
                return BadRequest(new
                {
                    message = "Email đã tồn tại"
                });
            }

            var customer = new Customer
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            _context.Customers.Add(customer);
            _context.SaveChanges();

            return Ok(new
            {
                message = "Đăng ký thành công",
                customerId = customer.Id
            });
        }

        // POST: api/Auth/CustomerLogin
        [HttpPost("CustomerLogin")]
        public IActionResult CustomerLogin([FromBody] CustomerLoginRequest request)
        {
            var email = request.Email?.Trim().ToLower();
            var customer = _context.Customers
                .FirstOrDefault(x => x.Email == email);

            if (customer == null || !BCrypt.Net.BCrypt.Verify(request.Password, customer.Password))
            {
                return Unauthorized(new
                {
                    message = "Email hoặc mật khẩu không đúng"
                });
            }

            return Ok(new
            {
                customerId = customer.Id,
                fullName = customer.FullName,
                email = customer.Email,
                phone = customer.Phone,
                address = customer.Address
            });
        }

        // POST: api/Auth/ForgotPassword
        [HttpPost("ForgotPassword")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var email = request.Email?.Trim().ToLower();
            var customer = _context.Customers
                .FirstOrDefault(x => x.Email == email);

            if (customer == null)
                return Ok(new { message = "Nếu email tồn tại, mật khẩu mới đã được gửi đến email của bạn." });

            string newPassword = GenerateRandomPassword(8);
            customer.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            _context.SaveChanges();

            var emailTask = _emailService.SendPasswordResetAsync(customer, newPassword);

            return Ok(new { message = "Nếu email tồn tại, mật khẩu mới đã được gửi đến email của bạn." });
        }

        private static string GenerateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        // POST: api/Auth/MigratePasswords
        // Chạy 1 lần duy nhất để hash password cũ (plain text) → BCrypt
        [HttpPost("MigratePasswords")]
        public IActionResult MigratePasswords()
        {
            int count = 0;

            foreach (var c in _context.Customers)
            {
                if (!string.IsNullOrEmpty(c.Password) && !c.Password.StartsWith("$2"))
                {
                    c.Password = BCrypt.Net.BCrypt.HashPassword(c.Password);
                    count++;
                }
            }

            foreach (var u in _context.Users)
            {
                if (!string.IsNullOrEmpty(u.PasswordHash) && !u.PasswordHash.StartsWith("$2"))
                {
                    u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(u.PasswordHash);
                    count++;
                }
            }

            _context.SaveChanges();

            return Ok(new
            {
                message = $"Đã migrate {count} tài khoản sang BCrypt"
            });
        }
    }

    public class CustomerLoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class CustomerRegisterRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Password { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }
}
