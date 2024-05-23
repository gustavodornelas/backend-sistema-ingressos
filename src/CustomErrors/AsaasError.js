class AsaasError extends Error {
    constructor(error) {

        const errorsMessage = 'Asaas error: ' + error.response.data.errors[0].description

        console.log(errorsMessage)

        super(errorsMessage);
        this.name = 'AsaasError';
    }
}

module.exports = AsaasError;
