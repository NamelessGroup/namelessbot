interface aocData {
    event: string
    owner_id: number
    members: {
        [id:number]:aocMember
    }
}

interface aocMember {
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