using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Controllers
{
    public class ProductWarehouseController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProductWarehouseController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index(int? productId)
        {
            var query = _context.ProductWarehouses
                .Include(pw => pw.Product)
                .Include(pw => pw.Warehouse)
                .AsQueryable();

            if (productId != null && productId > 0)
                query = query.Where(pw => pw.ProductId == productId);

            var items = query.OrderBy(pw => pw.ProductId).ThenBy(pw => pw.WarehouseId).ToList();

            ViewBag.ProductId = productId;
            ViewBag.ProductName = productId != null
                ? _context.Products.Find(productId)?.Name
                : null;
            ViewBag.ProductList = _context.Products.ToList();

            return View(items);
        }

        [HttpGet]
        public IActionResult Create(int? productId)
        {
            ViewBag.ProductList = new SelectList(_context.Products.ToList(), "Id", "Name", productId);
            ViewBag.WarehouseList = new SelectList(
                _context.Warehouses.Where(w => w.Status).ToList(), "Id", "Name");

            if (!_context.Warehouses.Any(w => w.Status))
                TempData["Error"] = "Chưa có kho hàng nào! Vui lòng thêm kho trước.";

            return View(new ProductWarehouse());
        }

        [HttpPost]
        public IActionResult Create(ProductWarehouse model)
        {
            if (ModelState.IsValid)
            {
                var exists = _context.ProductWarehouses.Any(pw =>
                    pw.ProductId == model.ProductId && pw.WarehouseId == model.WarehouseId);

                if (exists)
                {
                    ModelState.AddModelError("", "Sản phẩm này đã có tồn kho trong kho đã chọn!");
                }
                else
                {
                    _context.ProductWarehouses.Add(model);
                    _context.SaveChanges();
                    UpdateProductTotalStock(model.ProductId);
                    _context.SaveChanges();
                    return RedirectToAction("Index", new { productId = model.ProductId });
                }
            }

            ViewBag.ProductList = new SelectList(_context.Products.ToList(), "Id", "Name", model.ProductId);
            ViewBag.WarehouseList = new SelectList(
                _context.Warehouses.Where(w => w.Status).ToList(), "Id", "Name", model.WarehouseId);
            return View(model);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var item = _context.ProductWarehouses
                .Include(pw => pw.Product)
                .Include(pw => pw.Warehouse)
                .FirstOrDefault(pw => pw.Id == id);

            if (item == null) return NotFound();

            ViewBag.WarehouseList = new SelectList(
                _context.Warehouses.Where(w => w.Status).ToList(), "Id", "Name", item.WarehouseId);
            return View(item);
        }

        [HttpPost]
        public IActionResult Edit(ProductWarehouse model)
        {
            if (ModelState.IsValid)
            {
                var old = _context.ProductWarehouses.Find(model.Id);
                if (old == null) return NotFound();

                old.StockQuantity = model.StockQuantity;
                _context.SaveChanges();

                UpdateProductTotalStock(old.ProductId);
                _context.SaveChanges();

                return RedirectToAction("Index", new { productId = old.ProductId });
            }

            ViewBag.WarehouseList = new SelectList(
                _context.Warehouses.Where(w => w.Status).ToList(), "Id", "Name", model.WarehouseId);
            return View(model);
        }

        [HttpGet]
        public IActionResult Delete(int id)
        {
            var item = _context.ProductWarehouses
                .Include(pw => pw.Product)
                .Include(pw => pw.Warehouse)
                .FirstOrDefault(pw => pw.Id == id);

            if (item == null) return NotFound();

            return View(item);
        }

        [HttpPost]
        public IActionResult DeleteConfirmed(int id)
        {
            var item = _context.ProductWarehouses.Find(id);
            if (item == null) return NotFound();

            int productId = item.ProductId;
            _context.ProductWarehouses.Remove(item);
            _context.SaveChanges();

            UpdateProductTotalStock(productId);
            _context.SaveChanges();

            return RedirectToAction("Index", new { productId });
        }

        private void UpdateProductTotalStock(int productId)
        {
            var product = _context.Products.Find(productId);
            if (product != null)
            {
                product.StockQuantity = _context.ProductWarehouses
                    .Where(pw => pw.ProductId == productId)
                    .Sum(pw => pw.StockQuantity);
            }
        }
    }
}
