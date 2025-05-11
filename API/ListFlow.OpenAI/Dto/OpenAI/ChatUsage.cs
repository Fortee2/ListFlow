namespace ListFlow.OpenAI.Dto;

public class ChatUsage
{
    public int prompt_tokens { get; set; }
    public int completion_tokens { get; set; }
    public int total_tokens { get; set; }
}