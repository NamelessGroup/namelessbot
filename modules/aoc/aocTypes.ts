interface aoc_data {
    event: string
    owner_id: number
    members: {
        [id:number]:aoc_member
    }
}

interface aoc_member {
    last_start_ts: number
    id: number
    local_score: number
    stars: number
    name: string
    global_score: number
    completion_day_level: {
        [day:number]: {
            1: {
                get_star_ts: number
                star_index: number
            }
            2: {
                get_star_ts: number
                star_index: number
            }
        }
    }
}