using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class Warehouse
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên kho không được để trống")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Tỉnh/Thành phố không được để trống")]
        public string Province { get; set; }

        public string? Address { get; set; }

        public string? Phone { get; set; }

        public bool Status { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public virtual ICollection<ProductWarehouse>? ProductWarehouses { get; set; }
    }
}
