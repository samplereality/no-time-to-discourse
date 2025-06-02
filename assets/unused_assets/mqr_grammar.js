function createGrammar(RiTa, context) {
    return RiTa.grammar({
        start: "Hello | Goodbye",
        
    }, context);
}

export default createGrammar;