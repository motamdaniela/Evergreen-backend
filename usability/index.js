const { Builder, By, Key, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const service = new chrome.ServiceBuilder("chromedriver");

(async function loginTest() {
  try {
    let driver = await new Builder()
      .setChromeOptions(service)
      .forBrowser("chrome")
      .build();

    await driver.get("http://localhost:5173/");

    let title = await driver.getTitle();
    console.log(title);

    let login = await driver.findElement(By.id("login"));
    await login.click();

    let username = await driver.findElement(By.id("email"));
    let pass = await driver.findElement(By.id("pass"));
    let submit = await driver.findElement(By.id("ok"));
    await username.sendKeys("123bea");
    await driver.sleep(500);
    await pass.sendKeys("12345678");
    await driver.sleep(500);
    await submit.click();
    await driver.sleep(2000);
    await driver.quit();
  } catch (error) {
    console.log(error);
  }
})();

(async function logOutTest() {
  try {
    let driver = await new Builder()
      .setChromeOptions(service)
      .forBrowser("chrome")
      .build();

    await driver.get("http://localhost:5173/");

    let title = await driver.getTitle();
    console.log(title);

    let login = await driver.findElement(By.id("login"));
    await login.click();

    let username = await driver.findElement(By.id("email"));
    let pass = await driver.findElement(By.id("pass"));
    let submit = await driver.findElement(By.id("ok"));
    await username.sendKeys("123bea");
    await driver.sleep(500);
    await pass.sendKeys("12345678");
    await driver.sleep(500);
    await submit.click();
    await driver.sleep(1000);
    await driver.navigate().refresh();
    await driver.sleep(500);

    let profile = await driver.findElement(By.name("profilelink"));
    await profile.click();
    await driver.sleep(1000);
    let logOut = await driver.findElement(By.className("logoutbtn"));
    await logOut.click();
    await driver.sleep(3000);
    await driver.quit();
  } catch (error) {
    console.log(error);
  }
})();

(async function navigationTest() {
  try {
    let driver = await new Builder()
      .setChromeOptions(service)
      .forBrowser("chrome")
      .build();

    await driver.get("http://localhost:5173/");

    let title = await driver.getTitle();
    console.log(title);

    let faq = await driver.findElement(By.className("faqLink"));
    await faq.click();
    await driver.sleep(1000);

    await driver.navigate().back();
    await driver.sleep(1000);
    await driver.navigate().forward();
    await driver.sleep(1000);
    await driver.navigate().refresh();
    await driver.sleep(3000);
    await driver.quit();
  } catch (error) {
    console.log(error);
  }
})();

(async function interactionTest() {
  try {
    let driver = await new Builder()
      .setChromeOptions(service)
      .forBrowser("chrome")
      .build();

    await driver.get("http://localhost:5173/");

    let title = await driver.getTitle();
    console.log(title);

    let faq = await driver.findElement(By.className("faqLink"));
    await faq.click();
    await driver.sleep(1000);
    let about = await driver.findElement(By.className("aboutLink"));
    await about.click();
    await driver.sleep(1000);
    let landing = await driver.findElement(By.className("homeLink"));
    await landing.click();
    await driver.sleep(1000);
    let btn = await driver.findElement(By.id("btn0"));
    await btn.click();
    await driver.sleep(1000);
    let loginBtn = await driver.findElement(By.id("signUpBtn"));
    await loginBtn.click();

    await driver.sleep(3000);
    await driver.quit();
  } catch (error) {
    console.log(error);
  }
})();
