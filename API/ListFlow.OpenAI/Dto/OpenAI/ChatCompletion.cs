namespace ListFlow.OpenAI.Dto;

public class ChatCompletion
{
    public string id { get; set; }
    public string @object { get; set; }
    public int created { get; set; }
    public string model { get; set; }
    public ChatUsage usage { get; set; }
    public List<ChatChoices> choices { get; set; }
}