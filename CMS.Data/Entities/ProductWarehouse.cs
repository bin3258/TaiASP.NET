using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class ProductWarehouse
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }

        public int WarehouseId { get; set; }

        public int StockQuantity { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product? Product { get; set; }

        [ForeignKey("WarehouseId")]
        public virtual Warehouse? Warehouse { get; set; }
    }
}
