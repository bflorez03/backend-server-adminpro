// Common services responses

class Responses {

    internalErrorServer(err, res, message) {
        return res.status(500).json({
            ok: false,
            message: `${message}`,
            errors: err
        });
    }

    elementSaved(element, res, token) {
        return res.status(200).json({
            ok: true,
            userSaved: element,
            token: token,
            id: element.id
        });
    }

    elementCreated(element, res) {
        res.status(201).json({
            ok: true,
            userCreated: element
        });
    }

    elementDeleted(element, res){
        res.status(20).json({
            ok: true,
            userDeleted: element
        });
    }

    badRequestAuth(message, res) {
        res.status(400).json({
            ok: false,
            message: `${message}`,
        });
    }
}

module.exports = Responses;