
class ChatGPTExtension {
    constructor(){
        this.handleRequest()

    }

    handleRequest(){
        chrome.runtime.onMessage.addListener( (request, sender, response) => {
            if (request.action == "PROMPT") this.promptToChatGPT()
            console.log(request)
        })
    }

    promptToChatGPT() {
        const prompt = "Hello Chatgpt I love you"
        const input = document.querySelector("textarea")
        input.value = prompt
        document.querySelector("textarea~button").click()
    }

}

const CGPTExtension = new ChatGPTExtension()