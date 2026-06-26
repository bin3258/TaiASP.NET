namespace CMS.Backend.Settings
{
    public class EmailSettings
    {
        public string SendGridApiKey { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderName { get; set; } = "TaiCMS";
    }
}
