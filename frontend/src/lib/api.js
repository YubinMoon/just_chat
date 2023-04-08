import qs from "qs";

const fastapi = async (operation, url, params) => {
    let method = operation;
    let content_type = "application/json";
    let body = JSON.stringify(params);


    if (operation === "login") {
        method = "post";
        content_type = "application/x-www-form-urlencoded";
        body = qs.stringify(params);
    }

    let _url = process.env.REACT_APP_API_SERVER_URL + url;
    if (method === "get") {
        _url += "?" + new URLSearchParams(params);
    }

    let options = {
        method: method,
        headers: {
            "Content-Type": content_type,
        },
    };

    const _access_token = localStorage.getItem("login-token");
    if (_access_token) {
        options.headers["Authorization"] = "Bearer " + _access_token;
    }

    if (method !== "get") {
        options["body"] = body;
    }

    try {
        const response = await fetch(_url, options);

        if (response.status === 204) {
            // No content
            return;
        }

        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
            // 200 ~ 299
            return json;
        } else {
            throw json;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export default fastapi