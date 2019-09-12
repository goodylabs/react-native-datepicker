import {StyleSheet} from 'react-native';

let style = StyleSheet.create({
  dateTouch: {
    width: 142
  },
  dateTouchBody: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateIcon: {
    width: 32,
    height: 32,
    marginLeft: 5,
    marginRight: 5
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateText: {
    color: '#333'
  },
  placeholderText: {
    color: '#c9c9c9'
  },
  datePickerMask: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    backgroundColor: '#00000077'
  },
  datePickerCon: {
    backgroundColor: '#fff',
    height: 0,
    overflow: 'hidden'
  },
  btnText: {
    height: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnTextText: {
    fontSize: 16,
    color: '#46cf98'
  },
  btnTextCancel: {
    color: '#666'
  },
  btnCancel: {
    left: 0
  },
  btnConfirm: {
    right: 0
  },
  datePicker: {
    marginTop: 42,
    borderTopColor: '#ccc',
    borderTopWidth: 1
  },
  disabled: {
    backgroundColor: '#eee'
  },
  datepickerButtonsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  validDatesTitle: {
    fontSize: 13,
    color: '#555555',
    fontFamily: 'DINOT'
  },
  validDatesSelectorWrapper: {
    padding: 20
  },
  validDatesSelectorsRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginBottom: 40,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  validDateSelector: {
    width: 120,
    position: 'relative'
  },
  validDateSelectorNext: {
    left: -1
  },
  validDateSelectorLabel: {
    fontSize: 10,
    color: '#888888',
    fontFamily: 'DINOT'
  },
  validDateSelectorControlText: {
    fontSize: 13,
    fontFamily: 'DINOT'
  },
  validDateSelectorControlTextActive: {
    color: '#ffffff',
    fontFamily: 'DINOT-Bold'
  },
  validDateSelectorControl: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderColor: '#dedede',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  validDateSelectorControlActive: {
    backgroundColor: '#f09189',
    borderColor: '#af706b',
    zIndex: 2
  }
});

export default style;
