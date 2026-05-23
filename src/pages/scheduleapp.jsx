import React from "react";
import styled from "styled-components";
import { Agenda } from "@phoenixlan/phoenix.js";
import { useEffect } from "react";
import { useState } from "react";
import { ScheduleComponent } from "../components/scheduleComponent";

const S = {
    LoadingContainer: styled.div`
        display: ${props => props.loading ? "flex" : "none"};
    `,
    DefaultContainer: styled.div`
        display: ${props => props.loading ? "none" : "flex"};
        font-family: 'Roboto', sans-serif;
        flex-flow: column;
        user-select: none;
        gap: 2rem;
        padding-bottom: 2rem;
    `,
    HeaderContainer: styled.div`
        display: flex;
        flex-flow: column;
        flex: 0;
    `,
    LogoContainer: styled.div`
        flex: 1;
    `,
    Logo: styled.div`
        display: flex;
        flex-flow: column;
    `,
    LogoElement: styled.img`
        width: 16rem;
        margin: auto;
    `,
    LogoUnderTitle: styled.span`
        margin: auto;
        font-family: "ScheduleAppTitle";
        font-size: 1.5rem;
    `,
    DayContainer: styled.div`
        display: flex;
        flex-flow: column;
        gap: 1rem;
    `,
    ScheduleDayContainer: styled.div`
        display: flex;
        flex-flow: column;
        text-align: left;
        gap: .15rem;
        color: white;
        font-family: "ScheduleFont";
    `,
    ScheduleDay: styled.div`
        font-weight: 700;
        text-transform: capitalize;
        font-size: 1.1rem;
    `,
    ScheduleDate: styled.div`
        font-size: .75rem;
    `,
    SettingsContainer: styled.div`
        display: flex;
        margin: 0 1rem;
    `,
    CheckboxContainer: styled.div`
        display: flex;
        flex-flow: row;
        gap: .5rem;
    `,
    InputCheckbox: styled.input`
        position: relative;
        margin: 0;
    `,
    InputLabel: styled.span``,
    ScheduleContainer: styled.div`
        display: flex;
        flex-flow: row;
        gap: 2rem;
        margin: 0 1rem;

        @media screen and (max-width: 480px) {
            flex-flow: column;
        }
    `,
    RowContainer: styled.div`
        display: flex;
        flex-flow: row;
        gap: 6em;
    `,

    ClockContainer: styled.div`
        flex: 1;
        margin: auto 1rem;

        @media screen and (max-width: 480px) {
            display: none;
        }
    `,
    Clock: styled.div`
        display: flex;
        flex-flow: row;
        font-family: monospace;
        font-size: 2.75vw;
        font-weight: 400;
        letter-spacing: 0.1em;
    `,
    ClockColon: styled.span`
        opacity: ${props => props.visible ? "1" : "0"};
    `,
}

export const KazokuconInfo = () => {

    const [ loading, setLoading ] = useState(true);
    const [ agenda, setAgenda ] = useState([]);
    const [ completeSchedule, setCompleteSchedule ] = useState(null);
    const [ agendaError, setAgendaError ] = useState(false);
    const [ hideFinished, setHideFinished ] = useState(false);

    // Clock
    const [ hourClock, setHourClock ] = useState(undefined);
    const [ minuteClock, setMinuteClock ] = useState(undefined);
    const [ clockColonVisibility, setClockColonVisibility ] = useState(true);

    const Now = new Date().getTime();

    // Put all schedule elements into their respective days
    const completeScheduleObject = (data) => {
        let schedule = [];
        let dayMap = {};

        data.map((e) => {
            const d = new Date(e.time * 1000);
            const day = d.toLocaleString('no-NO', { weekday: 'long' });
            const date = d.toLocaleString('no-no', {day: 'numeric', month: 'short'});

            if (!dayMap[day]) {
                dayMap[day] = { day: day, date: date, unix: (e.time * 1000), events: [] };
            }

            e.day_key = day;
            dayMap[day].events.push(e);
            schedule.push(e);
        })
        setCompleteSchedule(dayMap);
    }

    const updateHideFinished = (data) => {
        localStorage.setItem("hideFinished", data);
        setHideFinished(data);
    }

    useEffect(() => {
        const initialise = async () => {
            // Show loading container
            setLoading(true);

            // Create clock
            const dateTime = new Date();
            setHourClock(String(dateTime.toLocaleTimeString('no', {hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo'}).slice(0, 2)));
            setMinuteClock(String(dateTime.toLocaleTimeString('no', {hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo'}).slice(3)));
            setClockColonVisibility(true);

            // Get storage
            const localStorageHideFinished = localStorage.getItem("hideFinished");
            if(localStorageHideFinished === "true") {
                setHideFinished(true);
            }

            // Attempt to fetch agendadata from the API
            try {
                const agendaData = await Agenda.getAgenda();
                if (agendaData) {
                    completeScheduleObject(agendaData);
                    setAgenda(agendaData);
                }    
            } catch(e) {
                console.error("An error occured while attempting to fetch data from agendadata from API.");
                console.error("Response: " + e);
            }
            
            // Disable the loading container and show the page.
            setLoading(false);
        }
        const inner = async () => {
            // Attempt to fetch agendadata from the API
            try {
                const agendaData = await Agenda.getAgenda();

                if(agendaData) {
                    completeScheduleObject(agendaData);
                    setAgenda(agendaData);
                    setAgendaError(false);
                }
            } catch(e) {
                console.error("An error occured while attempting to fetch data from agendadata from API.");
                console.error("Response: " + e);
                setAgendaError(true);
            }
        }

        const colonShift = () => {
            const dateTime = new Date();
            setHourClock(String(dateTime.toLocaleTimeString('no', {hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo'}).slice(0, 2)));
            setMinuteClock(String(dateTime.toLocaleTimeString('no', {hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo'}).slice(3)));
            setClockColonVisibility(clockColonVisibility => !clockColonVisibility);
        }
        
        // Initialise the code
        initialise();

        // Create intervals for updating the page
        const interval = setInterval(() => {
            inner();
        }, 30000);

        // Create intervals for colon shift
        const halfSecondInterval = setInterval(() => {
            colonShift();
        }, 1000);

        return () => {
            clearInterval(halfSecondInterval, interval);
        };

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            { /* Loading container */}
            <S.LoadingContainer loading={loading}>
                Vennligst vent ...
            </S.LoadingContainer>
            
            { /* Normal condition container */}
            <S.DefaultContainer loading={loading}>
                <S.HeaderContainer>
                    <S.RowContainer>
                        <S.ClockContainer>
                            <S.Clock>
                                {hourClock}<S.ClockColon visible={clockColonVisibility}>:</S.ClockColon>{minuteClock}
                            </S.Clock>
                        </S.ClockContainer>
                        <S.LogoContainer>
                            <S.Logo>
                                <S.LogoElement src="logo_kazokucon8neonage.png" />
                                <S.LogoUnderTitle>Program / Timeplan</S.LogoUnderTitle>
                            </S.Logo>
                        </S.LogoContainer>
                        <S.ClockContainer />
                    </S.RowContainer>
                </S.HeaderContainer>

                <S.SettingsContainer>
                    <S.CheckboxContainer>
                        <S.InputCheckbox type="checkbox" onClick={() => updateHideFinished(!hideFinished)} checked={hideFinished} />
                        <S.InputLabel>Skjul programposter som er ferdige</S.InputLabel>
                    </S.CheckboxContainer>
                </S.SettingsContainer>

                <S.ScheduleContainer>
                    {
                        completeSchedule?
                        Object.values(completeSchedule).map((eventDay) => {
                            return ( 
                                <S.DayContainer>
                                    <S.ScheduleDayContainer key={eventDay.day}>
                                        <S.ScheduleDay>{eventDay.day}</S.ScheduleDay>
                                        <S.ScheduleDate>{eventDay.date}</S.ScheduleDate>
                                    </S.ScheduleDayContainer>

                                    {
                                        eventDay.events
                                        .sort((a, b) => (a.pinned === b.pinned ? 0 : b.pinned ? 1 : -1))
                                        .map((event) => (
                                                <ScheduleComponent key={event.uuid} data={event} hideFinished={hideFinished} />
                                            )
                                        )
                                    }
                                </S.DayContainer>
                            )
                        })
                        :null
                    }
                </S.ScheduleContainer>
            </S.DefaultContainer>
        </>
    )
}