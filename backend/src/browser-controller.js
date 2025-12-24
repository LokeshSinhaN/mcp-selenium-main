import pkg from 'selenium-webdriver';
const { Builder, By, until } = pkg;
import chrome from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';
import { Options as EdgeOptions } from 'selenium-webdriver/edge.js';

const { Options: ChromeOptions, ServiceBuilder: ChromeServiceBuilder } = chrome;

// Local ChromeDriver binary path for MCP Selenium agent on this machine
const LOCAL_CHROMEDRIVER_PATH = 'C\\hyprtask\\lib\\Chromium\\chromedriver.exe';

class BrowserController {
  constructor() {
    this.drivers = new Map();
    this.currentSession = null;
  }

  async startBrowser(browserType = 'chrome', headless = false) {
    try {
      let builder = new Builder();
      let driver;

      switch (browserType.toLowerCase()) {
        case 'chrome': {
          const chromeOptions = new ChromeOptions();
          if (headless) chromeOptions.addArguments('--headless=new');
          chromeOptions.addArguments('--no-sandbox', '--disable-dev-shm-usage');

          // Always use the local ChromeDriver binary so the MCP agent talks to the correct browser
          const chromeService = new ChromeServiceBuilder(LOCAL_CHROMEDRIVER_PATH);

          driver = await builder
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .setChromeService(chromeService)
            .build();
          break;
        }
        case 'firefox': {
          const firefoxOptions = new FirefoxOptions();
          if (headless) firefoxOptions.addArguments('--headless');
          driver = await builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions).build();
          break;
        }
        case 'edge': {
          const edgeOptions = new EdgeOptions();
          if (headless) edgeOptions.addArguments('--headless=new');
          driver = await builder.forBrowser('edge').setEdgeOptions(edgeOptions).build();
          break;
        }
        default: throw new Error(`Unsupported browser: ${browserType}`);
      }

      const sessionId = `${browserType}_${Date.now()}`;
      this.drivers.set(sessionId, driver);
      this.currentSession = sessionId;
      await driver.manage().setTimeouts({ implicit: 10000 });

      return { sessionId, status: 'active', browser: browserType };
    } catch (error) {
      throw new Error(`Failed to start browser: ${error.message}`);
    }
  }

  getDriver() {
    const driver = this.drivers.get(this.currentSession);
    if (!driver) throw new Error('No active browser session. Start a browser first.');
    return driver;
  }

  async navigate(url) {
    const driver = this.getDriver();
    await driver.get(url);
    return { status: 'success', message: `Navigated to ${url}` };
  }

  getLocator(by, value) {
    switch (by.toLowerCase()) {
      case 'id': return By.id(value);
      case 'css': return By.css(value);
      case 'xpath': return By.xpath(value);
      case 'name': return By.name(value);
      case 'class': return By.className(value);
      case 'tag': return By.css(value);
      default: throw new Error(`Unsupported locator strategy: ${by}`);
    }
  }

  async click(by, value, timeout = 10000) {
    const driver = this.getDriver();
    const locator = this.getLocator(by, value);
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await driver.executeScript('arguments[0].scrollIntoView(true);', element);
    await element.click();
    return { status: 'success', message: 'Element clicked' };
  }

  async sendKeys(by, value, text, timeout = 10000) {
    const driver = this.getDriver();
    const locator = this.getLocator(by, value);
    const element = await driver.wait(until.elementLocated(locator), timeout);
    await element.clear();
    await element.sendKeys(text);
    return { status: 'success', message: `Text entered: ${text}` };
  }

  async getElementText(by, value, timeout = 10000) {
    const driver = this.getDriver();
    const locator = this.getLocator(by, value);
    const element = await driver.wait(until.elementLocated(locator), timeout);
    const text = await element.getText();
    return { status: 'success', text };
  }

  async takeScreenshot() {
    const driver = this.getDriver();
    const screenshot = await driver.takeScreenshot();
    return { status: 'success', screenshot: `data:image/png;base64,${screenshot}` };
  }

  async closeSession() {
    if (this.currentSession && this.drivers.has(this.currentSession)) {
      await this.drivers.get(this.currentSession).quit();
      this.drivers.delete(this.currentSession);
      this.currentSession = null;
    }
    return { status: 'closed' };
  }

  async cleanup() {
    for (const driver of this.drivers.values()) {
      try { await driver.quit(); } catch (e) { console.error(e); }
    }
    this.drivers.clear();
  }
}

export default BrowserController;
