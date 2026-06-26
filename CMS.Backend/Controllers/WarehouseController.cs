using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    public class WarehouseController : Controller
    {
        private readonly ApplicationDbContext _context;

        public WarehouseController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var warehouses = _context.Warehouses
                .OrderByDescending(w => w.CreatedDate)
                .ToList();
            return View(warehouses);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(Warehouse warehouse)
        {
            if (ModelState.IsValid)
            {
                _context.Warehouses.Add(warehouse);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(warehouse);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var warehouse = _context.Warehouses.Find(id);
            if (warehouse == null) return NotFound();
            return View(warehouse);
        }

        [HttpPost]
        public IActionResult Edit(Warehouse warehouse)
        {
            if (ModelState.IsValid)
            {
                var old = _context.Warehouses.Find(warehouse.Id);
                if (old == null) return NotFound();

                old.Name = warehouse.Name;
                old.Province = warehouse.Province;
                old.Address = warehouse.Address;
                old.Phone = warehouse.Phone;
                old.Status = warehouse.Status;

                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(warehouse);
        }

        [HttpGet]
        public IActionResult Delete(int id)
        {
            var warehouse = _context.Warehouses
                .Include(w => w.ProductWarehouses)
                .FirstOrDefault(w => w.Id == id);

            if (warehouse == null) return NotFound();

            if (warehouse.ProductWarehouses != null && warehouse.ProductWarehouses.Any())
            {
                TempData["Error"] = "Không thể xoá kho đang có hàng tồn!";
                return RedirectToAction("Index");
            }

            return View(warehouse);
        }

        [HttpPost]
        public IActionResult DeleteConfirmed(int id)
        {
            var warehouse = _context.Warehouses
                .Include(w => w.ProductWarehouses)
                .FirstOrDefault(w => w.Id == id);

            if (warehouse == null) return NotFound();

            if (warehouse.ProductWarehouses != null && warehouse.ProductWarehouses.Any())
            {
                TempData["Error"] = "Không thể xoá kho đang có hàng tồn!";
                return RedirectToAction("Index");
            }

            _context.Warehouses.Remove(warehouse);
            _context.SaveChanges();

            return RedirectToAction("Index");
        }
    }
}
