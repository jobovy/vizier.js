describe('The vizier.js example loading one file with ReadMe + data', () => {
  it('successfully loads', () => {
      cy.visit('/examples/onefile.html')
  })
  it('and makes the plot', () => {
      cy.get('#plotly-graph').find('.plot-container')
  })
})
