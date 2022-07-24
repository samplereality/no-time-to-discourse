var rules = {
    start: "$fire | $heat| $flood | $drought | $negative | $positive",
    positive: "$pos_emotion $subject $future $pos_status.",
    negative: "$neg_emotion $subject $predicate $status.",
    neg_emotion: "Gutted. | Melancholia. | A deep well of sadness. | Despairing.",
    pos_emotion: "Was it all bad? | Relief. | A ray of light.",
    subject: "Everything | The world | Life",
    predicate: "was | is | had been | is now",
    future: "is now | will be | has a chance to be",
    status: "canceled | lost | postponed",
    pos_status: "better | not as bad as before",
    fire: "Wildfires rage across the countryside.",
    heat: "A heatwave has shutdown nearby cities and towns.",
    flood: "Flooding threatens low-lying areas.",
    drought: "Drinking water levels are at an all-time low."
}