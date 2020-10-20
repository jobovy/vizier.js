describe('The basic vizier.js example page', () => {
  it('successfully loads', () => {
      cy.visit('/examples/basic.html')
  })
  it('and makes the plot', () => {
      cy.get('#plotly-graph').find('.plot-container')
  })
})
