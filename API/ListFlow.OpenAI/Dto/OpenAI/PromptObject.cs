using System.Text.Json;

namespace ListFlow.OpenAI.Dto;

public class PromptObject
{
    public PromptObject(ChatObject[] PromptText, string AIModel = "text-davinci-003")
    {
        model = AIModel;
        messages = PromptText;
    }

    public string model { get; set; }

    public ChatObject[] messages { get; set; }

    public static PromptObject Load(ChatObject[] AIPrompt)
    {
        return new PromptObject(AIPrompt, "gpt-3.5-turbo");
    }

    public string ToJson()
    {
        return JsonSerializer.Serialize(this);
    }
}