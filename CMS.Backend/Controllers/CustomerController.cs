using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Backend.Controllers
{
    public class CustomerController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Danh sách
        public IActionResult Index(int page = 1)
        {
            int pageSize = 10;
            var query = _context.Customers.AsQueryable();

            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var customers = query
                .OrderByDescending(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.Page = page;
            ViewBag.TotalPages = totalPages;

            return View(customers);
        }

        // ==========================
        // THÊM KHÁCH HÀNG
        // ==========================

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(Customer customer)
        {
            if (!ModelState.IsValid)
                return View(customer);

            customer.Password = BCrypt.Net.BCrypt.HashPassword(customer.Password);
            _context.Customers.Add(customer);
            _context.SaveChanges();

            return RedirectToAction("Index");
        }

        // ==========================
        // SỬA KHÁCH HÀNG
        // ==========================

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var customer = _context.Customers.Find(id);

            if (customer == null)
                return NotFound();

            customer.Password = null;
            return View(customer);
        }

        [HttpPost]
        public IActionResult Edit(Customer customer)
        {
            if (!ModelState.IsValid)
                return View(customer);

            var existing = _context.Customers.Find(customer.Id);
            if (existing == null)
                return NotFound();

            existing.FullName = customer.FullName;
            existing.Email = customer.Email;
            existing.Phone = customer.Phone;
            existing.Address = customer.Address;

            if (!string.IsNullOrEmpty(customer.Password))
            {
                existing.Password = BCrypt.Net.BCrypt.HashPassword(customer.Password);
            }

            _context.SaveChanges();

            return RedirectToAction("Index");
        }

        // ==========================
        // XÓA KHÁCH HÀNG
        // ==========================

        [HttpPost]
        public IActionResult Delete(int id)
        {
            var customer = _context.Customers.Find(id);

            if (customer == null)
                return NotFound();

            _context.Customers.Remove(customer);
            _context.SaveChanges();

            return RedirectToAction("Index");
        }
    }
}