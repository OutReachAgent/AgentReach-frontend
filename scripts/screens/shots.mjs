// Screens captured for the marketing pages. `ready` is text that must be on
// screen before the capture; `act` opens the state worth showing.
export const SHOTS = [
  { name: 'dashboard', path: '/dashboard', ready: 'Outreach Template Performance' },
  { name: 'email-tracking', path: '/email-campaigns?campaign=ec_retail', ready: 'Priya' },
  {
    name: 'email-template',
    path: '/email-campaigns?new=1',
    ready: 'Who should get this?',
    act: async (page) => {
      await page.getByRole('button', { name: /Priya Raman/ }).first().click();
      await page.getByRole('button', { name: /^Next/ }).click();
      await page.getByPlaceholder('e.g. Schedule a demo').fill('Book a 20-minute demo');
      await page.getByPlaceholder('e.g. Tech founders').fill('Retail operations leaders');
      await page.getByRole('button', { name: /^Generate/ }).click();
      await page.getByText('is peak planning still living in spreadsheets').first().waitFor({ timeout: 20000 });
      await page.getByRole('button', { name: 'Close notification' }).click();
      await page.getByText('Email Preview', { exact: true }).evaluate((el) => el.scrollIntoView({ block: 'start' }));
    },
  },
  {
    name: 'calling-campaign',
    path: '/calling-campaigns',
    ready: 'Ops leaders demo booking',
    act: async (page) => {
      await page
        .locator('div')
        .filter({ hasText: 'Ops leaders demo booking' })
        .filter({ has: page.getByRole('button', { name: 'View Calls' }) })
        .last()
        .getByRole('button', { name: 'View Calls' })
        .click();
      await page.getByText('Dialed Call Logs').waitFor();
      await page.locator('button:has(svg.lucide-chevron-down)').first().click();
      await page.getByText('Conversational Transcript').waitFor();
      await page.mouse.move(900, 600);
      await page.mouse.wheel(0, 210);
    },
  },
  {
    name: 'calling-agent',
    path: '/ai-calling-bots',
    ready: 'Agent Library',
    act: async (page) => {
      await page.getByRole('button', { name: /Ava, demo booking/ }).click();
      await page.getByRole('button', { name: /^Edit/ }).click();
      await page.getByText('Edit Agent').waitFor();
    },
  },
  { name: 'scheduler', path: '/scheduler', ready: 'Holiday peak readiness' },
  { name: 'signals', path: '/signals', ready: 'Contoso Freight raises' },
  { name: 'playbooks', path: '/signals/playbooks', ready: 'Funding round, intro email' },
  {
    name: 'prospects',
    path: '/prospects?search=ps_retail',
    ready: 'Lakeshore Market Co.',
    act: async (page) => {
      await page.getByRole('button', { name: 'companies', exact: true }).click();
      await page.getByText('Neighbourhood grocery chain').waitFor();
    },
  },
  {
    name: 'contact-finder',
    path: '/contact-finder',
    act: async (page) => {
      const input = page.getByPlaceholder('Company domain or name, e.g. stripe.com');
      await input.fill('fabrikam.example');
      await input.press('Enter');
      await page.getByText('Mina').first().waitFor();
    },
  },
  {
    name: 'inbox',
    path: '/inbox?folder=campaigns',
    ready: 'Priya Raman',
    act: async (page) => {
      await page.getByText('a calmer peak season at Contoso Freight').first().click();
      await page.getByText('Thursday at 10').first().waitFor();
    },
  },
  {
    name: 'scout',
    path: '/ai-command-center',
    ready: 'Fabrikam ops contacts',
    act: async (page) => {
      await page.getByText('Fabrikam ops contacts').first().click();
      await page.getByText('Contact Finder').first().waitFor();
    },
  },
];
