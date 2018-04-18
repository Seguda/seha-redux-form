import React from 'react';
import {reduxForm, Field, SubmissionError,focus} from 'redux-form';
import Input from './input';
import { required, nonEmpty, exactLength, onlyNumbers } from '../validators';
const exactLength5 = exactLength(5);


    export class ComplaintForm extends React.Component {
        onSubmit(values){
            return fetch('https://us-central1-delivery-form-api.cloudfunctions.net/api/report', {
    method: 'POST',
    body: JSON.stringify(values),
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(res => {
        if (!res.ok) {
            if (
                res.headers.has('content-type') &&
                res.headers
                    .get('content-type')
                    .startsWith('application/json')
            ) {
               
                return res.json().then(err => Promise.reject(err));
            }
           
            return Promise.reject({
                code: res.status,
                message: res.statusText
            });
        }
        return;
    })
    .then(() => console.log('Submitted with values', values))
    .catch(err => {
        const { reason, message, location } = err;
        if (reason === 'ValidationError') {
            
            return Promise.reject(
                new SubmissionError({
                    [location]: message
                })
            );
        }
        return Promise.reject(
            new SubmissionError({
                error: message
            })
        );
    });
    }
    render() {
        let successMessage;
        if (this.props.submitSucceeded) {
            successMessage = (
                <div className="message message-success">
                    Report submitted successfully
                </div>
            );
        }

        let errorMessage;
        if (this.props.error) {
            errorMessage = (
                <div className="message message-error">{this.props.error}</div>
            );
        }

        return(
          <div>
              <header>
            <h1>Report a problem with your delivery </h1>
          </header>
      
            <form onSubmit={this.props.handleSubmit(values => this.onSubmit(values)
            )}>
                {successMessage}
                {errorMessage}
            
                    <Field name="trackingNumber" id="trackingNumber" label="Tracking Number Required" component={Input} 
                        validate={[
                            required,
                            nonEmpty,
                            exactLength5,
                            onlyNumbers
                        ]}/>
                <br/>
           
                    <Field component={Input} element="select" name="issue" label="What is your issue?">
                    <option value="not delivered">My delivery hasn't arrived.</option>
                        <option value="wrong-item">The wrong item was delivered</option>
                        <option value="missing-part">Part of my order was missing</option>
                        <option value="damaged">Some of my order arrived damaged</option>
                        <option value="other">Other(give details below</option>
            </Field>
            <br/>
            
            <Field name="details" id="details" label="Give more details(optional)" component={Input} element="textarea"/>
            <button 
            type="submit"
            disabled={
                this.props.pristine || this.props.submitting}>
            Submit
            </button>
            </form>   
            </div>                
        )};
    }



export default reduxForm({
        form:'complaint',
        onSubmitFail: (errors, dispatch) =>
        dispatch(focus('complaint', Object.keys(errors)[0]))
})(ComplaintForm)