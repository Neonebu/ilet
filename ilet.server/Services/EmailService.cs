namespace ilet.server.Services
{
    using ilet.server.Interfaces;
    using System.Net;
    using System.Net.Mail;
    using System.Threading.Tasks;

    public class EmailService : IEmailService
    {
        public async Task SendAsync(string to, string subject, string body)
        {
            var mail = new MailMessage();
            mail.From = new MailAddress("seninadresin@example.com");
            mail.To.Add(to);
            mail.Subject = subject;
            mail.Body = body;

            using var smtp = new SmtpClient("smtp.example.com", 587)
            {
                Credentials = new NetworkCredential("seninadresin@example.com", "şifren"),
                EnableSsl = true
            };

            await smtp.SendMailAsync(mail);
        }
    }

}
