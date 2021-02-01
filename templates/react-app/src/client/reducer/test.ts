const initialState = {
    title: ''
};

function theDefaultReducer(state: IKV = initialState, action: string) {
    switch (action) {
        case 'test':
            break;

        default:
            break;
    }
    return state;
}

export { theDefaultReducer as default };
