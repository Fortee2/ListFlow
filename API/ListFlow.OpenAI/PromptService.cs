using System.Net.Http.Headers;
using System.Text.Json;
using ListFlow.OpenAI.Dto;
using ListFlow.OpenAI.Interfaces;

namespace ListFlow.OpenAI;
public class PromptService: IPromptService
{
    private readonly string _token;

    public PromptService (string ApiToken)
    {
        _token = ApiToken;
    }

    public async Task<ChatCompletion> Submit(string PromptData)
    {
        // Create a new HttpClient to make the API request
        using (var client = new HttpClient())
        {
            // Set the API endpoint URL
            var endpoint = "https://api.openai.com/v1/chat/completions";

            // Set the API request headers
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

            var content = new StringContent(
                (PromptObject.Load(new[] {
                    new ChatObject("system", "You are a marketing writer that creates engaging listings for ebay.  From the data provided create the item description section for a listing."),
                    new ChatObject("user", PromptData) })).ToJson(), System.Text.Encoding.UTF8, "application/json"
            ); ;

            // Send the API request and get the response
            var response = await client.PostAsync(endpoint, content);

            if (response.IsSuccessStatusCode)
            {
                string responseContent = await response.Content.ReadAsStringAsync();
                ChatCompletion chatCompletion = JsonSerializer.Deserialize<ChatCompletion>(responseContent);

                // Return the transcription result as the response to the HTTP request
                //TODO: Chat GPT can be asked to return multiple choices.  Would we always use just one?
                //TODO: Determine what the error response is from ChatGPT and return the appropriate status
                return chatCompletion;
            }

            return new ChatCompletion();
        }
    }
}

