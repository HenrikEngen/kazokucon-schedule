import { faCircleXmark, faPlay, faThumbTack, faWarning } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";

const types = {
    default2: { primary: "#76536a", secondary: "#d7cbd2", tertiary: "#9f8795" },
    cancelled2: { primary: "#F44336", secondary: "#FFCDD2", tertiary: "#E57373" },
    pinned2: { primary: "#a320c6", secondary: "#e3bfee", tertiary: "#bf68d8" },
    warning2: { primary: "#FF9800", secondary: "#FFE0B2", tertiary: "#FFB74D" },
    success2: { primary: "#4CAF50", secondary: "#C8E6C9", tertiary: "#81C784" },
    live2: { primary: "#4CAF50", secondary: "#C8E6C9", tertiary: "#81C784"},
    finished2: { primary: "#76536a", secondary: "repeating-linear-gradient(-45deg,#baa9b4,#baa9b4 5px,#d7cbd2 5px,#d7cbd2 10px)", tertiary: "#d7cbd2" }
}

const S = {
    Root: styled.div`
        display: ${props => props.visible ? "flex" : "none"};
        padding: 1rem;
        background: ${props => props.secondary};
        border-left: .35rem solid ${props => props.primary};
        gap: .5rem;
        font-family: "ScheduleFont";
        color: black;
    `,
    LeftContainer: styled.div`
        display: flex;
        flex-flow: column;
        min-width: 3rem;
    `,
    TimeContainer: styled.div`
        display: flex;
        height: 1.35rem;
    `,
    Time: styled.span`
        margin: auto;
        font-size: 1rem;
        text-decoration: ${props => props.strikeThrough ? "line-through" : "none"};
        color: ${props => props.warn ? types.warning2.primary : "inherit"};
        color: ${props => props.color ? props.color : "default2"};
    `,
    DeviatingTimeContainer: styled.div`
        display: ${props => props.visible ? "flex" : "none"};
        height: 1.35rem;
    `,
    DeviatingTime: styled.span`
        margin: auto;
        color: ${types.warning2.primary};
        font-weight: 700;

        color: ${props => props.finished ? types.finished2.primary : null};
    `,

    MiddleContainer: styled.div`
        display: flex;
        flex-flow: column;
        gap: .4rem;
        flex: 1;
    `,
    RightContainer: styled.div``,
    IconContainer: styled.div`
        display: flex;
        flex-flow: column;
        position: relative;
        gap: .4rem;
        top: 2px;
    `,
    Icon: styled.div`
        display: ${props => props.visible ? "flex" : "none"};
        color: ${props => props.warning ? types.warning2.primary : null};
        color: ${props => props.pinned ? types.pinned2.primary : null};
        color: ${props => props.live ? types.live2.primary : null};
        color: ${props => props.cancelled ? types.cancelled2.primary : null};
    `,
    TitleContainer: styled.div`
        display: flex;
        height: 1.35rem;
    `,
    Title: styled.span`
        font-weight: 600;
        font-size: 1.05rem;
        margin: auto 0;
    `,
    LabelContainer: styled.div`
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    `,
    Label: styled.span`
        font-size: 0.75rem;
        display: ${props => props.visible ? "block" : "none"};
        background-color: ${props => props.labelColor};
        padding: .2rem .35rem .15rem .35rem;
        border-radius: 1rem;
        
        background-color: ${types.default2.tertiary};
        background-color: ${props => props.warning ? types.warning2.tertiary : null};
        background-color: ${props => props.pinned ? types.pinned2.tertiary : null};
        background-color: ${props => props.live ? types.live2.tertiary : null};
        background-color: ${props => props.cancelled ? types.cancelled2.tertiary : null};
        background-color: ${props => props.finished ? types.finished2.tertiary : null};
    `,
    DescriptionContainer: styled.div`
        display: ${props => props.visible ? "flex" : "none"};
        flex: 1;
    `,
    Description: styled.span`
        font-size: .75rem;
    `,

    DeviatingInformationContainer: styled.div`
        display: ${props => props.visible ? "flex" : "none"};
        flex: 1;
    `,
    DeviatingInformation: styled.span`
        font-size: .8rem;
        font-weight: 500;
        color: ${props => props.color ? props.color : "default2"};
    `,
}

const SCHEDULE_STATES = {
    DEFAULT: 0,
    LIVE: 1,
    FINISHED: 2,
    PINNED: 3,
    DELAYED: 4,
    CANCELLED: 5
}

export const ScheduleComponent = ({data, hideFinished}) => {

    const ScheduleDay = new Date(data.time * 1000).toLocaleString('no', {weekday: 'long', timeZone: 'Europe/Oslo'});
    const ScheduleTime = new Date(data.time * 1000).toLocaleString('no', {hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Oslo'});

    const Now = new Date().getTime();
    const Live = (new Date().getTime()) - (data.time * 1000);

    const [ scheduleState, setScheduleState ] = useState(null);
    const [ scheduleType, setScheduleType ] = useState(null);

    const [ finished, setFinished ] = useState(false);
    const [ delayed, setDelayed ] = useState(false);
    const [ cancelled, setCancelled ] = useState(false);
    const [ pinned, setPinned ] = useState(false);

    const DeviatingScheduleTime = () => {
        if(data.deviating_time_unknown) {
            return "TBD";
        }
        if(data.deviating_time) {
            return new Date(data.deviating_time * 1000).toLocaleString('no', {hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Oslo'});
        }
        return false;
    }

    const DetermineWarningLabelSelector = () => {
        if(data.deviating_time_unknown || data.deviating_time) {
            return "Forsinket";
        }
        return false;
    }

    const DetermineLive = () => {
        setFinished(false);
        setCancelled(false);
        setDelayed(false);
        setPinned(false);

        if (data.cancelled) { setScheduleState(SCHEDULE_STATES.CANCELLED); setScheduleType("cancelled2"); setCancelled(true); return; }
        if (data.deviating_time_unknown) { setScheduleState(SCHEDULE_STATES.DELAYED); setScheduleType("warning2"); setDelayed(true); return; }

        if (data.deviating_time) {
            // Forsinket tid er satt
            setDelayed(true);

            if (Now - data.deviating_time*1000 <= 0)  {
                // Før skjema ifht. forsinket tid    
                setScheduleState(SCHEDULE_STATES.DELAYED);
                setScheduleType("warning2");
                return;
            } else {
                // Etter skjema
                if(data.duration) {
                    // Hvis det er satt en varighet på eventet
                    console.debug(data.title + " varer i " + data.duration + " minutter.")
                    if(new Date(data.deviating_time*1000 + data.duration*60000 + 10*60000) - Now >= 0) {
                        // Hvis klokka er etter eventet startet, men før det er planlagt sluttet (duration)
                        console.debug(data.title + " har startet, og varer i " + (new Date((data.deviating_time*1000 + data.duration*60000) - Now).getMinutes()) + " minutter til")
                        setScheduleState(SCHEDULE_STATES.LIVE);
                        setScheduleType("live2");
                        return;
                    } else {
                        // Hvis klokka er etter eventet er planlagt sluttet (duration)
                        setFinished(true);
                        setScheduleState(SCHEDULE_STATES.FINISHED);
                        setScheduleType("finished2");
                        return;
                    }
                } else {
                    setFinished(true);
                    setScheduleState(SCHEDULE_STATES.FINISHED);
                    setScheduleType("finished2");
                    return;
                }   
            }
        } else {
            // Forsinket tid er ikke satt
            if (Now - data.time*1000 <= 0)  {
                // Før skjema
                if (data.pinned) { 
                    // Festet
                    setScheduleType("pinned2"); 
                    setPinned(true); 
                    return;
                } else {
                    // Ikke festet
                    setScheduleState(SCHEDULE_STATES.DEFAULT);
                    setScheduleType("default2");
                    return;
                }
            } else {
                // Etter skjema
                if(data.duration) {
                    // Hvis det er satt en varighet på eventet
                    console.debug(data.title + " varer i " + data.duration + " minutter.")
                    if(new Date(data.time*1000 + data.duration*60000 + 10*60000) - Now >= 0) {
                        // Hvis klokka er etter eventet startet, men før det er planlagt sluttet (duration)
                        console.debug(data.title + " har startet, og varer i " + (new Date((data.time*1000 + data.duration*60000) - Now).getMinutes()) + " minutter til")
                        setScheduleState(SCHEDULE_STATES.LIVE);
                        setScheduleType("live2");
                        return;
                    } else {
                        // Hvis klokka er etter eventet er planlagt sluttet (duration)
                        setFinished(true);
                        setScheduleState(SCHEDULE_STATES.FINISHED);
                        setScheduleType("finished2");
                        return;
                    }
                } else {
                    setFinished(true);
                    setScheduleState(SCHEDULE_STATES.FINISHED);
                    setScheduleType("finished2");
                    return;
                } 
            }
        }
    }

    useEffect(() => {
        DetermineLive();
    }, [data])

    return (
        <>
            <S.Root primary={types[scheduleType]?.primary || types['default2'].primary} secondary={types[scheduleType]?.secondary || types['default2'].secondary} visible={hideFinished ? finished ? false : true : true} >
                <S.LeftContainer>
                    <S.TimeContainer>
                        <S.Time strikeThrough={delayed || cancelled} color={types[scheduleType]?.primary || types['default2'].primary}>
                            {ScheduleTime}
                        </S.Time>
                    </S.TimeContainer>
                    <S.DeviatingTimeContainer visible={delayed}>
                        <S.DeviatingTime finished={scheduleState == SCHEDULE_STATES.FINISHED}>
                            {DeviatingScheduleTime()}
                        </S.DeviatingTime>
                    </S.DeviatingTimeContainer>
                </S.LeftContainer>
                
                <S.MiddleContainer>
                    <S.TitleContainer>
                        <S.Title>{data.title}</S.Title>
                    </S.TitleContainer>
                    <S.LabelContainer>
                        <S.Label visible={data.location}>{data.location??null}</S.Label>
                        <S.Label visible={finished && !cancelled} finished>Ferdig</S.Label>
                        <S.Label visible={scheduleState == SCHEDULE_STATES.LIVE} live>Startet</S.Label>
                        <S.Label visible={!finished && delayed} warning>Forsinket</S.Label>
                        <S.Label visible={scheduleState == SCHEDULE_STATES.CANCELLED} cancelled>Avlyst</S.Label>
                    </S.LabelContainer>
                    <S.DeviatingInformationContainer visible={data.deviating_information}>
                        <S.DeviatingInformation color={types[scheduleType]?.primary || types['default2'].primary}>{data.deviating_information}</S.DeviatingInformation>
                    </S.DeviatingInformationContainer>
                    <S.DescriptionContainer visible={data.description}>
                        <S.Description>{data.description}</S.Description>
                    </S.DescriptionContainer>
                </S.MiddleContainer>

                <S.RightContainer>
                    <S.IconContainer>
                        <S.Icon visible={!finished && delayed} warning><FontAwesomeIcon icon={faWarning} /></S.Icon>
                        <S.Icon visible={cancelled} cancelled><FontAwesomeIcon icon={faCircleXmark} /></S.Icon>
                        <S.Icon visible={scheduleState == SCHEDULE_STATES.LIVE} live><FontAwesomeIcon icon={faPlay} /></S.Icon>
                        <S.Icon visible={data.pinned} pinned><FontAwesomeIcon icon={faThumbTack} /></S.Icon>
                    </S.IconContainer>
                </S.RightContainer>
            </S.Root>
        </>
    )

}