describe('The basic vizier.js example page without jQuery', () => {
    it('throws the expected error', () => {
	cy.on('uncaught:exception', (err, runnable) => {
	    if ( err.message.includes('Please load jquery before loading vizier.js') )
		return false
	    else
		return true
	})
      cy.visit('/browser-tests/basic_nojquery_error.html')
    })
})
