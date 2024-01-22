//@ts-check
const { webkit } = require('playwright');

(async () => {
  if (process.argv.length != 4) {
    console.log('usage: node check_ama_membership.ts <AMA_NUMBER> <LAST_NAME>');
    process.exit(1);
  }
  const amaNumber = process.argv[2];
  const lastName = process.argv[3];

  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();

  try {
    // Go to verify page
    await page.goto('https://www.modelaircraft.org/membership/verify');
    
    // Fill form values
    await page.fill('#edit-ama-number', amaNumber);
    await page.fill('#edit-last-name', lastName);

    // Click submit, wait 3 seconds
    await page.click('#edit-actions');
    await page.waitForTimeout(3000);

    // Check message and report
    const hasErrorMessage = await page.isVisible(".messages--error");
    const hasSuccessMessage = await page.isVisible(".messages--status");
    if (hasErrorMessage && hasSuccessMessage) {
      throw new Error ("Found both an error and success message.");
    } else if (!hasErrorMessage && !hasSuccessMessage) {
      throw new Error ("Unable to find status or error message.");
    } else if (hasErrorMessage) {
      console.log('Unable to verify membership.');
    }
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();
