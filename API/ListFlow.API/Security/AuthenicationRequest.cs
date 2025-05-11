using System.ComponentModel.DataAnnotations;

namespace ListFlow.API.Security;

public class AuthenticateRequest
{
    [Required] public string Username { get; set; }

    [Required] public string Password { get; set; }
}