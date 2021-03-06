describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('the landing page should render the getting started button', () => {
    cy.contains(/^get started$/i).should('be.visible');
  });

  it('the getting started button should open the editor', () => {
    cy.contains(/^get started$/i).click();
    cy.location('hash').should('eq', '#/upload');
  });
});
