using System;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.WebUtilities;
using System.IO;

namespace ListFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AudioController : ControllerBase
    {
        private const string ChatGPTApiUrl = "https://api.openai.com/v1/engines/davinci/transcriptions";
        private const string token = "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";


        [HttpPost]
        public async Task<IActionResult> Post([FromBody] string audioData)
        {
            try
            {
                // Convert the base64 encoded string to a byte array
                var audioBytes = Convert.FromBase64String(audioData);

                // Create a new HttpClient to make the API request
                using (var client = new HttpClient())
                {
                    // Set the API endpoint URL
                    var endpoint = "https://api.openai.com/v1/audio/transcriptions";

                    // Set the API request headers
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

                    // Create a new MultipartFormDataContent object to hold the audio data
                    MultipartFormDataContent content = new MultipartFormDataContent();

                    content.Add(new StringContent("whisper-1"), "model");
                    content.Add(new ByteArrayContent( audioBytes), "file", "audio.wav");

                    // Send the API request and get the response
                    var response = await client.PostAsync(endpoint, content);
                    var responseContent = await response.Content.ReadAsStringAsync();

                    // Return the transcription result as the response to the HTTP request
                    return Ok(responseContent);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


    }
}

