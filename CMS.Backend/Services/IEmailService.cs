using CMS.Data.Entities;

namespace CMS.Backend.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(Order order, Customer customer, List<OrderDetail> orderDetails);
        Task SendPasswordResetAsync(Customer customer, string newPassword);
    }
}
