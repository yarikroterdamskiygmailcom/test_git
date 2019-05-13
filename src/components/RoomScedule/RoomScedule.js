﻿import React from 'react';
import moment from 'moment'
import { connect } from "react-redux";
import PropTypes from 'prop-types';

import './RoomScedule.scss';
import DayScedule from '../DayScedule/DayScedule';
import { withStyles, TextField, Button, Typography } from '@material-ui/core';
import Wrapper from '../../layouts/Wrapper';
import { postTicket, deleteTickets, putTicket } from '../../redux/actions/tickets';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  margin: {
    margin: theme.spacing.unit,
  }
});

class RoomScedule extends React.Component {
  state = {
    date: localStorage.getItem("date") || moment().format('YYYY-MM-DD'),
    start: '10:00',
    end: '11:00',
    open: false,
  }

  handleOpen = () => {
    this.setState({
      open: true,
      isBooked: false
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  onChange = (e) => {
    const { name, value } = e.target
    this.setState({
      [name]: value
    })
    localStorage.setItem([name], value)
  }

  onAdd = e => {
    e.preventDefault();
    const { date, start, end } = this.state;

    this.props.postTicket({
      hall_id: localStorage.getItem("currentHallId"),
      user_id: localStorage.getItem("userId"),
      from: new Date(date + 'T' + start).getTime() + 1,
      to: new Date(date + 'T' + end).getTime() - 1,
      title: 'AAAAAA'
    });
  }

  onCorrect = e => {
    e.preventDefault();

    const { date, start, end } = this.state;
    const { tickets, correctTicket } = this.props;
    let ticketId = null;

    tickets.forEach(ticket => {
      if (moment(`${date}T${start}:55`).isBetween(ticket.from, ticket.to, 'millisecond')) {
        ticketId = ticket._id
      }
    });

    correctTicket({
      hall_id: localStorage.getItem("currentHallId"),
      user_id: localStorage.getItem("userId"),
      from: new Date(`${date}T${start}`).getTime() + 1,
      to: new Date(`${date}T${end}`).getTime() - 1,
    }, ticketId);
  }

  onDelete = e => {
    e.preventDefault();

    const { date, start, end } = this.state;
    const { tickets, deleteTicket } = this.props;
    let ticketId = null;

    tickets.forEach(ticket => {
      if (moment(`${date}T${start}:55`).isBetween(ticket.from, ticket.to, 'millisecond')) {
        ticketId = ticket._id
      }
    });

    deleteTicket({
      hall_id: localStorage.getItem("currentHallId"),
      user_id: localStorage.getItem("userId"),
      from: new Date(date + 'T' + start).getTime() + 1,
      to: new Date(date + 'T' + end).getTime() - 1,
    }, ticketId);
  }

  render() {
    const { classes, tickets } = this.props;
    const { date, start, end } = this.state;
    const isAuthenticated = !!localStorage.getItem('token');
    const currentHallId = localStorage.getItem("currentHallId")

    const isActive = tickets.some(ticket => {
      if (currentHallId === ticket.hall_id) {
        return moment(`${date}T${start}:05`).isBetween(ticket.from, ticket.to, 'milliseconds')
      }
    });
    console.log(isActive);

    return (
      <div>
        <form className="roomscedule" noValidate onSubmit={this.onAdd}>
          <div className="picker-container">
            <TextField
              id="date"
              label={(isAuthenticated ? "Book" : "Check") + " room for date"}
              type="date"
              name='date'
              value={date}
              className={classes.textField}
              inputProps={{ min: moment().format('YYYY-MM-DD') }}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.onChange}
            />

            {isAuthenticated && (
              <Wrapper>
                <TextField
                  id="time"
                  label="Start event"
                  type="time"
                  name="start"
                  value={start}
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{ min: "10:00", max: "18:00", step: "1" }}
                  onChange={this.onChange}
                />
                <TextField
                  id="time"
                  label="End event"
                  type="time"
                  name='end'
                  value={end}
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{ min: start, max: "18:00", step: "1" }}
                  onChange={this.onChange}
                />
              </Wrapper>)
            }
          </div>

          <DayScedule currentDate={this.state} {...this.props} />

          {isAuthenticated
            ? <Button
              type="submit"
              className={classes.margin}
              color='primary'
              variant='contained'
              onClick={this.onAdd}>
              Book the room
              </Button>
            : <Typography>
              <Button
                href='/sign-in'
                variant='text'
                className={classes.margin}
                color='secondary'>
                Login
                </Button>
              for book the room
              </Typography>
          }

          {isAuthenticated &&
            <Wrapper>
              <Button
                className={classes.margin}
                color='secondary'
                disabled={!isActive}
                variant='contained'
                onClick={this.onCorrect}>
                Correct ticket
            </Button>
              OR
            <Button
                className={classes.margin}
                color='secondary'
                disabled={!isActive}
                variant='contained'
                onClick={this.onDelete}>
                Delete ticket--
            </Button>
            </Wrapper>
          }
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    tickets: state.tickets.tickets
  };
};

const mapDispatchToProps = dispatch => {
  return {
    postTicket: (user) => dispatch(postTicket(user)),
    correctTicket: (user, ticketId) => dispatch(putTicket(user, ticketId)),
    deleteTicket: (user, ticketId) => dispatch(deleteTickets(user, ticketId)),
  };
};

RoomScedule.propTypes = {
  tickets: PropTypes.array.isRequired,
  postTicket: PropTypes.func.isRequired,
  deleteTicket: PropTypes.func.isRequired,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RoomScedule));

