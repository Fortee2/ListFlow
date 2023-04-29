namespace ListFlow.Business{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public T Data { get; set; }

        public ServiceResult()
        {
            Success = true;
        }

        public ServiceResult(string errorMessage)
        {
            Success = false;
            ErrorMessage = errorMessage;
        }

        public ServiceResult(T data)
        {
            Success = true;
            Data = data;
        }
    }

}