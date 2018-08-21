import React, { Component } from 'react';
import { Modal, Menu, Image, Button, Segment} from 'semantic-ui-react'
import ParkInfo from "./ParkInfo";
import ParkEvents from "./ParkEvents";
import ParkAlerts from "./ParkAlerts";


class ParkDetails extends Component {
    state={
        parkInfo:{},
        imageIndex: 0,
        events: [],
        alerts: [],
        tab: 'info',
        loading: {
            info: true,
            alerts: true,
            events: true
        }
    }

    
    componentDidMount(){
        let parkId = this.props.match.params.park
        // Fetch park show page
        fetch(`https://still-wildwood-14519.herokuapp.com/parks/${parkId}`)
        .then(res=>res.json())
        .then(parkInfo=>this.setState({parkInfo:parkInfo, loading: {...this.state.loading,info:false}},this.setImageScroll))

        // Fetch alerts
        fetch(`https://still-wildwood-14519.herokuapp.com/parks/${parkId}/alerts`)
        .then(res=>res.json())
        .then(alerts=>this.setState({alerts:alerts.data, loading: {...this.state.loading,alerts:false}}))

        // Fetch Events
        fetch(`https://still-wildwood-14519.herokuapp.com/parks/${parkId}/events`)
        .then(res=>res.json())
        .then(events=>this.setState({events:events.data, loading: {...this.state.loading,events:false}}))
    }

    setImageScroll = () => {
        if (this.state.parkInfo.image_sources.length>1)
        this.interval = setInterval(()=>{
            let nextImageIndex = this.state.imageIndex + 1
            if (nextImageIndex > this.state.parkInfo.image_sources.length-1) {
                nextImageIndex = 0
            }
		    this.setState({
			    imageIndex: nextImageIndex
		    })
        },3000)
    }


    handleUserFollowPark = () => {
        fetch(`https://still-wildwood-14519.herokuapp.com/follow/${this.state.parkInfo.id}`, 
        {method:"POST",
        headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(json => {
        console.log(json)
        
      });
    }
  

    componentWillUnmount(){
        clearInterval(this.interval)
    }

    currentTab = () => {
        switch (this.state.tab) {
            case 'info':
                return <ParkInfo parkInfo={this.state.parkInfo} loading={this.state.loading.info}/>
            case 'events':
                return <ParkEvents events={this.state.events} loading={this.state.loading.events}/>
            case 'alerts':
                return <ParkAlerts alerts={this.state.alerts} loading={this.state.loading.alerts}/>
        }
    }
    handleItemClick = (e, { name }) => this.setState({ tab: name })

    render() { 
        const {parkInfo, events, alerts, tab} = this.state
        return (
        <React.Fragment >
            <Modal.Header>{parkInfo.full_name}</Modal.Header>
                <Modal.Content image scrolling>
                    {parkInfo.image_sources &&
                    <Image wrapped size="massive" src={parkInfo.image_sources[this.state.imageIndex]}/>}
                    <Modal.Description>
                        <Menu attached='top' tabular>
                            <Menu.Item 
                                name='info' active={tab === 'info'} 
                                onClick={this.handleItemClick} />
                            <Menu.Item
                                name='events'active={tab === 'events'}
                                onClick={this.handleItemClick}
                            />
                            <Menu.Item
                                name='alerts'active={tab === 'alerts'}
                                onClick={this.handleItemClick}
                            />
                        </Menu>
                        <Segment attached='bottom'>
                            {this.currentTab()}
                        </Segment>
                        {this.props.loggedIn && <Button onClick={this.handleUserFollowPark}>Follow Park</Button>}
                    </Modal.Description>
                </Modal.Content>
        </React.Fragment>  );
    }
}
 
export default ParkDetails;