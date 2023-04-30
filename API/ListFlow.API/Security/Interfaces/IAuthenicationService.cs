namespace ListFlow.API.Security
{
    public interface IAuthenicationService
    {
        AuthenticateResponse? Authenticate(AuthenticateRequest model);
    }
}