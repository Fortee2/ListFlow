using System.Text.Json;

namespace ListFlow.OpenAI.Dto;

public class ChatObject
{
    public ChatObject(string role, string messageContent)
    {
        this.role = role;
        content = messageContent;
    }

    public string role { get; set; }

    public string content { get; set; }

    public static ChatObject Load(string role, string promptContent)
    {
        return new ChatObject(role, promptContent);
    }

    public string ToJson()
    {
        return JsonSerializer.Serialize(this);
    }
}