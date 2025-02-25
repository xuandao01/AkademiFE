import './Event.css';
import React, { useEffect, useState, useMemo  } from 'react';
import { Badge, Calendar } from 'antd';
import { Button, DatePicker, TimePicker, notification, Input, Radio, Row } from 'antd';
import {
    PlusOutlined, CloseCircleOutlined
  } from '@ant-design/icons';
import './Dashboard.css';
import axios from 'axios';
const getListData = (value, events) => {
    return events[value.format('YYYY-MM-DD')] || [];
};

const getMonthData = (value, events) => {
    return events[value.format('YYYY-MM-DD')] || [];
};

const colorList = ['#41fc03', '#03fcca','#3552f2','#8a39ed','#f5333a', '#fcba03'];
const Context = React.createContext({
    name: 'Default',
  });

const Dashboard = () => {
    const [currentColor, setCurrentColor] = useState('#fcba03'); 
    const [isShow, setIsShow] = useState(false);
    const [eventDate, setEventDate] = useState('');
    const [eventFrom, setEventFrom] = useState(null);
    const [eventTo, setEventTo] = useState(null);
    const [eventContent, setEventContent] = useState('');
    const [api, contextHolder] = notification.useNotification();
    const [events, setEvent] = useState({
        // '2025-02-01': [{ type: 'VII A', content: 'Math Test' }, { type: 'VII C', content: 'Meeting' }],
        // '2025-02-02': [{ type: 'VII B', content: 'Science Project' }],
        // '2025-02-03': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-04': [{ type: 'VII C', content: 'Teaching schedule' }, { type: 'VII C', content: 'Meeting' }],
        // '2025-02-05': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-07': [{ type: 'VII C', content: 'Teaching schedule' }],
        // '2025-02-10': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-11': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-12': [{ type: 'VII C', content: 'Teaching schedule' }],
        // '2025-02-14': [{ type: 'VII B', content: 'Teaching schedule' }, { type: 'VII C', content: 'Meeting' }],
        // '2025-02-17': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-18': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-19': [{ type: 'VII C', content: 'Teaching schedule' }],
        // '2025-02-21': [{ type: 'VII B', content: 'Teaching schedule' }],
        // '2025-02-23': [{ type: 'VII B', content: 'Science Project' }],
    });

    useEffect(() => {
        getEvent();
    }, [])

    const getEvent = () => {
        let userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            let reference_id = userData.role.toLowerCase() == 'teacher' ? userData.teacherId : userData.studentId;
            fetch(`http://localhost:8080/events?data_type=${userData.role.toLowerCase()}&reference_id=${reference_id}`).then(res => {
                res.json().then(data => {
                    const groupedObject = data.reduce((acc, item) => {
                        if (!acc[item.date]) {
                          acc[item.date] = [];
                        }
                        acc[item.date].push(item);
                        return acc;
                      }, {});
                      setEvent(groupedObject);
                      console.log(groupedObject);
                })
            })
        }
    }

    const monthCellRender = (value) => {
        const listData = getMonthData(value, events);
        console.log(listData);
        return listData.length ? (
            <ul className="events">
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge color={item.color} text={item.content} />
                    </li>
                ))}
            </ul>
        ) : null;
    };

    // const getStatusColor = (grade) => {
    //     switch (grade) {
    //         case 'VII A':
    //             return '#FB7D5B'; 
    //         case 'VII B':
    //             return '#FCC43E'; 
    //         case 'VII C':
    //             return '#4D44B5';  
    //         default:
    //             return '#9E9E9E';  
    //     }
    // };

    const dateCellRender = (value) => {
        const listData = getListData(value, events);
        return listData.length ? (
            <ul className="events">
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge color={item.color} text={item.content} />
                    </li>
                ))}
            </ul>
        ) : null;
    };

    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        if (info.type === 'month') return monthCellRender(current);
        return info.originNode;
    };

    const handleAddEvent = () => {
        setIsShow(true);
    }

    const onChange = (date, dateString) => {
        console.log(date, dateString);
      };

    const saveEvent = async () => {
        if (!eventContent) {
            openNotification('topRight', 'Error', 'Missing title', 'error');
            // Missing content
            return;
        }
        if (!eventDate) {
            openNotification('topRight', 'Error', 'Missing date', 'error');
            // Missing date
            return
        }

        let userData = JSON.parse(localStorage.getItem("user"));
        let payload = {
            date: eventDate,
            from: '',
            to: '',
            color: currentColor,
            data_type: userData.role.toLowerCase(),
            content: eventContent,
            reference_id: userData.role.toLowerCase() == 'teacher' ? userData.teacherId : userData.studentId
        }
        await axios.post('http://localhost:8080/events', payload)
        openNotification('topRight', 'Success', 'Add event success', 'success');
        getEvent();
        setIsShow(false);
    }
    const openNotification = (placement, mes, des, type) => {
        api[type]({
          message: mes,
          description: des,
          placement,
        });
      };
    const contextValue = useMemo(
        () => ({
            name: 'Ant Design',
        }),
        [],
    );
    return (
        <Context.Provider value={contextValue}>
        {contextHolder}
            <div>
                <Button onClick={handleAddEvent} className="add-event" icon={<PlusOutlined/>}>Add event</Button>
                <Calendar
                    cellRender={cellRender}
                    mode="month"
                    className='tc-dash-all'
                />
                {
                    isShow &&
                    <div className='add-event-popup'>
                        <div className='popup-center'>
                            <div style={{fontSize: 22, padding: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700}} className='popup-title'>
                                <div>Add event</div>
                                <CloseCircleOutlined onClick={() => {setIsShow(false)}} />
                            </div>
                            <div className='popup-content'>
                                <div className='popup-row'>
                                    <div className='color-tag' style={{backgroundColor: currentColor, height: 10, width: 10}}></div>
                                    <div className='event-name'>
                                        <input onChange={() => {setEventContent(event.target.value)}} placeholder='Event title' className='event-name-inp'></input>
                                    </div>
                                </div>
                                <div className='popup-row' style={{display: 'flex', justifyContent: 'space-between'}}>
                                    {
                                        colorList.map((color, index) => {
                                            return (<div onClick={() => {setCurrentColor(color)}} style={{backgroundColor: color, cursor: 'pointer', height: 20, width: 20, borderRadius: '50%'}} key={index}></div>)
                                        })
                                    }
                                </div>
                                <div className='popup-row'>
                                    <DatePicker onChange={(date, dateString) => {setEventDate(dateString)}} />
                                </div>
                                <div className='popup-row'>
                                    <TimePicker placeholder="Start" onChange={onChange}  />
                                    <TimePicker placeholder="End" onChange={onChange}  />
                                </div>
                            </div>
                            <div style={{position: 'absolute', bottom: 12, right: 12}} className='popup-footer'>
                                <Button type='primary' onClick={saveEvent}>Save</Button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </Context.Provider>
    );
};

export default Dashboard;
