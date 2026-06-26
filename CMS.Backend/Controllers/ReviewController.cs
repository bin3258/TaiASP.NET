using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    public class ReviewController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index(int page = 1)
        {
            int pageSize = 10;
            var query = _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .AsQueryable();

            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            var reviews = query
                .OrderByDescending(r => r.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            ViewBag.Page = page;
            ViewBag.TotalPages = totalPages;

            return View(reviews);
        }

        [HttpGet]
        public IActionResult Reply(int id)
        {
            var review = _context.Reviews
                .Include(r => r.Product)
                .Include(r => r.Customer)
                .FirstOrDefault(r => r.Id == id);

            if (review == null) return NotFound();

            return View(review);
        }

        [HttpPost]
        public IActionResult Reply(int id, string reply)
        {
            var review = _context.Reviews.Find(id);
            if (review == null) return NotFound();

            review.Reply = reply;
            review.ReplyDate = DateTime.Now;
            _context.SaveChanges();

            return RedirectToAction("Index");
        }
    }
}
