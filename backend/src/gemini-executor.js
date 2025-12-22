import { GoogleGenerativeAI } from '@google/generative-ai';
import BrowserController from './browser-controller.js';

class GeminiExecutor {
  constructor(apiKey) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.browserController = new BrowserController();
    this.model = 'gemini-2.5-flash';
  }

  getAvailableTools() {
    return [
      { name: 'start_browser', description: 'Start browser', input_schema: { type: 'object', properties: { browserType: { type: 'string', enum: ['chrome', 'firefox', 'edge'] }, headless: { type: 'boolean' } }, required: ['browserType'] } },
      { name: 'navigate', description: 'Navigate to URL', input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] } },
      { name: 'click', description: 'Click element', input_schema: { type: 'object', properties: { by: { type: 'string', enum: ['id', 'css', 'xpath'] }, value: { type: 'string' } }, required: ['by', 'value'] } },
      { name: 'send_keys', description: 'Type text', input_schema: { type: 'object', properties: { by: { type: 'string' }, value: { type: 'string' }, text: { type: 'string' } }, required: ['by', 'value', 'text'] } },
      { name: 'get_element_text', description: 'Get text', input_schema: { type: 'object', properties: { by: { type: 'string' }, value: { type: 'string' } }, required: ['by', 'value'] } },
      { name: 'take_screenshot', description: 'Take screenshot' },
      { name: 'close_session', description: 'Close browser' }
    ];
  }

  async executeTool(name, args) {
    try {
      switch (name) {
        case 'start_browser': return await this.browserController.startBrowser(args.browserType, args.headless);
        case 'navigate': return await this.browserController.navigate(args.url);
        case 'click': return await this.browserController.click(args.by, args.value);
        case 'send_keys': return await this.browserController.sendKeys(args.by, args.value, args.text);
        case 'get_element_text': return await this.browserController.getElementText(args.by, args.value);
        case 'take_screenshot': return await this.browserController.takeScreenshot();
        case 'close_session': return await this.browserController.closeSession();
        default: throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  async executePrompt(userPrompt, onLog) {
    const log = (msg, type = 'info') => onLog?.({ timestamp: new Date().toISOString(), type, message: msg });
    
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const systemPrompt = "You are a web automation agent. Always start by checking if a browser is open or starting one. Take screenshots after significant actions. Use CSS selectors preferred.";
      
      const messages = [{ role: 'user', content: userPrompt }];
      let iterations = 0;
      
      while (iterations++ < 15) {
        log(`Gemini thinking (step ${iterations})...`, 'info');
        const result = await model.generateContent({
          contents: messages,
          systemInstruction: systemPrompt,
          tools: [{ functionDeclarations: this.getAvailableTools() }]
        });

        const response = result.response;
        const text = response.text();
        if (text) log(`AI: ${text}`, 'gemini');

        const calls = response.functionCalls();
        if (!calls || calls.length === 0) {
          log('Task completed.', 'success');
          break;
        }

        for (const call of calls) {
          log(`Tool: ${call.name} (${JSON.stringify(call.args)})`, 'action');
          const toolResult = await this.executeTool(call.name, call.args);
          
          if(toolResult.status === 'error') log(`Error: ${toolResult.error}`, 'error');
          else log('Tool executed successfully', 'success');

          // Important: Add the function response back to history
          messages.push({ role: 'model', parts: [{ functionCall: call }] });
          messages.push({ role: 'function', parts: [{ functionResponse: { name: call.name, response: toolResult } }] });
        }
      }
    } catch (e) {
      log(`Execution failed: ${e.message}`, 'error');
    }
  }
}

export default GeminiExecutor;
