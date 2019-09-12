import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  DatePickerAndroid,
  TimePickerAndroid,
  DatePickerIOS,
  Platform,
  Animated,
  Keyboard
} from 'react-native';

import Style from './style';

const FORMATS = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DD HH:mm',
  time: 'HH:mm'
};

const SUPPORTED_ORIENTATIONS = ['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right'];

class DatePicker extends Component {
  state = {
    date: null,
    modalVisible: false,
    animatedHeight: new Animated.Value(0),
    allowPointerEvents: true,
    isValidDate: null,
    validDates: {prev: null, next: null},
    confirmed: false,
    proposedDate: null
  };

  componentDidUpdate(prevProps) {
    const {date} = this.props;
    if (prevProps.date !== date) {
      this.setState({ date: this.getDate(date) }); // eslint-disable-line
    }
  }

  setModalVisible = (visible) => {
    const {height, duration} = this.props;
    const {animatedHeight} = this.state;

    // slide animation
    if (visible) {
      this.setState({modalVisible: visible});
      return Animated.timing(animatedHeight, {
        toValue: height,
        duration
      }).start();
    } else {
      return Animated.timing(animatedHeight, {
        toValue: 0,
        duration
      }).start(() => {
        this.setState({
          modalVisible: visible,
          confirmed: false,
          validaDates: {prev: null, next: null},
          isValidDate: null,
          proposedDate: null
        });
      });
    }
  };

  onStartShouldSetResponder = e => true;

  onMoveShouldSetResponder = e => true;

  onPressMask = () => {
    const {onPressMask} = this.props;
    if (typeof onPressMask === 'function') {
      onPressMask();
    } else {
      this.onPressCancel();
    }
  };

  onPressCancel = () => {
    const {onCloseModal} = this.props;
    this.setModalVisible(false);

    if (typeof onCloseModal === 'function') {
      onCloseModal();
    }
  };

  onPressConfirm = async () => {
    const {onCloseModal, validate} = this.props;
    const {date, confirmed, proposedDate: stateProposedDate} = this.state;

    if (typeof validate === 'function' && !confirmed) {
      const response = await validate(Moment(date).unix());
      this.setState({confirmed: true});

      if (response) {
        const {isValidDate, nextValidDate, prevValidDate} = response;
        if (isValidDate) {
          this.datePicked();
          this.setModalVisible(false);
        } else {
          let proposedDate;

          if (nextValidDate.isDefault) {
            proposedDate = nextValidDate.date;
          }
          if (prevValidDate.isDefault) {
            proposedDate = prevValidDate.date;
          }

          this.setState({
            isValidDate,
            validDates: {
              prev: {
                ...prevValidDate,
                selected: prevValidDate.isDefault || false
              },
              next: {
                ...nextValidDate,
                selected: nextValidDate.isDefault || false
              }
            },
            proposedDate
          });
        }
      }
    } else if (typeof validate === 'function' && confirmed) {
      this.setState(
        {
          date: new Date(stateProposedDate * 1000)
        },
        () => {
          this.datePicked();
          this.setModalVisible(false);
        },
      );
    } else {
      this.datePicked();
      this.setModalVisible(false);
    }

    if (typeof onCloseModal === 'function') {
      onCloseModal();
    }
  };

  getDate = (date = this.props.date) => {
    const {mode, minDate, maxDate, format = FORMATS[mode]} = this.props;

    // date默认值
    if (!date) {
      const now = new Date();
      if (minDate) {
        const _minDate = this.getDate(minDate);

        if (now < _minDate) {
          return _minDate;
        }
      }

      if (maxDate) {
        const _maxDate = this.getDate(maxDate);

        if (now > _maxDate) {
          return _maxDate;
        }
      }

      return now;
    }

    if (date instanceof Date) {
      return date;
    }

    return Moment(date, format).toDate();
  };

  getDateStr = (date = this.props.date) => {
    const {getDateStr} = this.props;
    const {mode, format = FORMATS[mode]} = this.props;

    const dateInstance = date instanceof Date ? date : this.getDate(date);

    if (typeof getDateStr === 'function') {
      return getDateStr(dateInstance);
    }

    return Moment(dateInstance).format(format);
  };

  formatDate = timestamp => Moment(timestamp).format('DD.MM.YYYY');

  datePicked = () => {
    const {onDateChange} = this.props;
    const {date} = this.state;

    if (typeof onDateChange === 'function') {
      onDateChange(this.getDateStr(date), date);
    }
  };

  getTitleElement = () => {
    const {date, placeholder, customStyles, allowFontScaling} = this.props;

    if (!date && placeholder) {
      return (
        <Text allowFontScaling={allowFontScaling} style={[Style.placeholderText, customStyles.placeholderText]}>
          {placeholder}
        </Text>
      );
    }
    return (
      <Text allowFontScaling={allowFontScaling} style={[Style.dateText, customStyles.dateText]}>
        {this.getDateStr()}
      </Text>
    );
  };

  onDateChange = (date) => {
    this.setState({
      allowPointerEvents: false,
      date
    });
    const timeoutId = setTimeout(() => {
      this.setState({
        allowPointerEvents: true
      });
      clearTimeout(timeoutId);
    }, 200);
  };

  onDatePicked = ({action, year, month, day}) => {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: new Date(year, month, day)
      });
      this.datePicked();
    } else {
      this.onPressCancel();
    }
  };

  onTimePicked = ({action, hour, minute}) => {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: Moment()
          .hour(hour)
          .minute(minute)
          .toDate()
      });
      this.datePicked();
    } else {
      this.onPressCancel();
    }
  };

  onDatetimePicked = ({action, year, month, day}) => {
    const {mode, androidMode, format = FORMATS[mode], is24Hour = !format.match(/h|a/)} = this.props;
    const {date} = this.state;

    if (action !== DatePickerAndroid.dismissedAction) {
      const timeMoment = Moment(date);

      TimePickerAndroid.open({
        hour: timeMoment.hour(),
        minute: timeMoment.minutes(),
        is24Hour,
        mode: androidMode
      }).then(this.onDatetimeTimePicked.bind(this, year, month, day));
    } else {
      this.onPressCancel();
    }
  };

  onDatetimeTimePicked = (year, month, day, {action, hour, minute}) => {
    if (action !== DatePickerAndroid.dismissedAction) {
      this.setState({
        date: new Date(year, month, day, hour, minute)
      });
      this.datePicked();
    } else {
      this.onPressCancel();
    }
  };

  onPressDate = () => {
    const {disabled, onOpenModal} = this.props;
    const {date} = this.state;

    if (disabled) {
      return true;
    }

    Keyboard.dismiss();

    // reset state
    this.setState({
      date: this.getDate()
    });

    if (Platform.OS === 'ios') {
      this.setModalVisible(true);
    } else {
      const {
        mode,
        androidMode,
        format = FORMATS[mode],
        minDate,
        maxDate,
        is24Hour = !format.match(/h|a/)
      } = this.props;

      // 选日期
      if (mode === 'date') {
        DatePickerAndroid.open({
          date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate),
          mode: androidMode
        }).then(this.onDatePicked);
      } else if (mode === 'time') {
        // 选时间

        const timeMoment = Moment(date);

        TimePickerAndroid.open({
          hour: timeMoment.hour(),
          minute: timeMoment.minutes(),
          is24Hour,
          mode: androidMode
        }).then(this.onTimePicked);
      } else if (mode === 'datetime') {
        // 选日期和时间

        DatePickerAndroid.open({
          date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate),
          mode: androidMode
        }).then(this.onDatetimePicked);
      }
    }

    if (typeof onOpenModal === 'function') {
      onOpenModal();
    }
  };

  selectProposedDate = (date) => {
    const {validDates} = this.state;
    this.setState({
      validDates: {
        prev: {
          ...validDates.prev,
          selected: date === 'prev'
        },
        next: {
          ...validDates.next,
          selected: date === 'next'
        }
      },
      proposedDate: validDates[date].date
    });
  };

  _renderValidDatesSelector = () => {
    const {customStyles, invalidDateMessage, validDatesTitle, nextValidDateLabel, prevValidDateLabel} = this.props;
    const {validDates, date} = this.state;

    return (
      <View style={Style.validDatesSelectorWrapper}>
        {invalidDateMessage(this.getDateStr(date))}
        <View style={{marginVertical: 20}}>
          <Text style={[Style.validDatesTitle, customStyles.validDatesTitle]}>{validDatesTitle}</Text>
        </View>
        <View style={Style.validDatesSelectorsRow}>
          {validDates.prev && (
            <View style={[Style.validDateSelector, Style.validDateSelectorPrev, customStyles.validDateSelector]}>
              <Text style={[Style.validDateSelectorLabel, customStyles.validDateSelectorLabel]}>
                {prevValidDateLabel}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (!validDates.prev.selected) {
                    this.selectProposedDate('prev');
                  }
                }}
                style={[
                  Style.validDateSelectorControl,
                  customStyles.validDateSelectorControl,
                  validDates.prev.selected ? Style.validDateSelectorControlActive : ''
                ]}
              >
                <Text
                  style={[
                    Style.validDateSelectorControlText,
                    customStyles.validDateSelectorControlText,
                    validDates.prev.selected ? Style.validDateSelectorControlTextActive : '',
                    validDates.prev.selected ? customStyles.validDateSelectorControlTextActive : ''
                  ]}
                >
                  {this.formatDate(validDates.prev.date * 1000)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {validDates.next && (
            <View style={[Style.validDateSelector, Style.validDateSelectorNext, customStyles.validDateSelector]}>
              <Text style={[Style.validDateSelectorLabel, customStyles.validDateSelectorLabel]}>
                {nextValidDateLabel}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (!validDates.next.selected) {
                    this.selectProposedDate('next');
                  }
                }}
                style={[
                  Style.validDateSelectorControl,
                  validDates.next.selected ? Style.validDateSelectorControlActive : ''
                ]}
              >
                <Text
                  style={[
                    Style.validDateSelectorControlText,
                    customStyles.validDateSelectorControlText,
                    validDates.next.selected ? Style.validDateSelectorControlTextActive : '',
                    validDates.next.selected ? customStyles.validDateSelectorControlTextActive : ''
                  ]}
                >
                  {this.formatDate(validDates.next.date * 1000)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  _renderIcon = () => {
    const {showIcon, iconSource, iconComponent, customStyles} = this.props;

    if (showIcon) {
      if (iconComponent) {
        return iconComponent;
      }
      return <Image style={[Style.dateIcon, customStyles.dateIcon]} source={iconSource} />;
    }

    return null;
  };

  render() {
    const {
      mode,
      style,
      customStyles,
      disabled,
      minDate,
      maxDate,
      minuteInterval,
      timeZoneOffsetInMinutes,
      cancelBtnText,
      confirmBtnText,
      TouchableComponent,
      testID,
      cancelBtnTestID,
      confirmBtnTestID,
      allowFontScaling,
      locale,
      hideText
    } = this.props;

    const {confirmed, animatedHeight, allowPointerEvents, date, modalVisible} = this.state;

    const dateInputStyle = [
      Style.dateInput,
      customStyles.dateInput,
      disabled && Style.disabled,
      disabled && customStyles.disabled
    ];

    return (
      <TouchableComponent
        style={[Style.dateTouch, style]}
        underlayColor="transparent"
        onPress={this.onPressDate}
        testID={testID}
      >
        <View style={[Style.dateTouchBody, customStyles.dateTouchBody]}>
          {!hideText ? <View style={dateInputStyle}>{this.getTitleElement()}</View> : <View />}
          {this._renderIcon()}
          {Platform.OS === 'ios' && (
            <Modal
              transparent={true}
              animationType="none"
              visible={modalVisible}
              supportedOrientations={SUPPORTED_ORIENTATIONS}
              onRequestClose={() => {
                this.setModalVisible(false);
              }}
            >
              <View style={{flex: 1}}>
                <TouchableComponent
                  style={Style.datePickerMask}
                  activeOpacity={1}
                  underlayColor="#00000077"
                  onPress={this.onPressMask}
                >
                  <TouchableComponent underlayColor="#fff" style={{flex: 1}}>
                    <Animated.View
                      style={[Style.datePickerCon, {height: animatedHeight}, customStyles.datePickerCon]}
                    >
                      {!confirmed ? (
                        <View pointerEvents={allowPointerEvents ? 'auto' : 'none'}>
                          <DatePickerIOS
                            date={date}
                            mode={mode}
                            minimumDate={minDate && this.getDate(minDate)}
                            maximumDate={maxDate && this.getDate(maxDate)}
                            onDateChange={this.onDateChange}
                            minuteInterval={minuteInterval}
                            timeZoneOffsetInMinutes={timeZoneOffsetInMinutes ? timeZoneOffsetInMinutes : null}
                            style={[Style.datePicker, customStyles.datePicker]}
                            locale={locale}
                          />
                        </View>
                      ) : (
                        this._renderValidDatesSelector()
                      )}

                      <View style={[Style.datepickerButtonsWrapper, customStyles.datepickerButtonsWrapper]}>
                        <TouchableComponent
                          underlayColor="transparent"
                          onPress={this.onPressConfirm}
                          style={[Style.btnText, Style.btnConfirm, customStyles.btnConfirm]}
                          testID={confirmBtnTestID}
                        >
                          <Text
                            allowFontScaling={allowFontScaling}
                            style={[Style.btnTextText, customStyles.btnTextConfirm]}
                          >
                            {confirmBtnText}
                          </Text>
                        </TouchableComponent>
                        <TouchableComponent
                          underlayColor={'transparent'}
                          onPress={this.onPressCancel}
                          style={[Style.btnText, Style.btnCancel, customStyles.btnCancel]}
                          testID={cancelBtnTestID}
                        >
                          <Text
                            allowFontScaling={allowFontScaling}
                            style={[Style.btnTextText, Style.btnTextCancel, customStyles.btnTextCancel]}
                          >
                            {cancelBtnText}
                          </Text>
                        </TouchableComponent>
                      </View>
                    </Animated.View>
                  </TouchableComponent>
                </TouchableComponent>
              </View>
            </Modal>
          )}
        </View>
      </TouchableComponent>
    );
  }
}

DatePicker.defaultProps = {
  mode: 'date',
  androidMode: 'default',
  date: '',
  // component height: 216(DatePickerIOS) + 1(borderTop) + 42(marginTop), IOS only
  height: 259,

  // slide animation duration time, default to 300ms, IOS only
  duration: 300,
  confirmBtnText: '确定',
  cancelBtnText: '取消',
  iconSource: require('./date_icon.png'),
  customStyles: {},

  // whether or not show the icon
  showIcon: true,
  disabled: false,
  allowFontScaling: true,
  hideText: false,
  placeholder: '',
  TouchableComponent: TouchableHighlight,
  modalOnResponderTerminationRequest: e => true,
  validate: null,
  invalidDateMessage: null,
  validDatesTitle: null,
  nextValidDateLabel: null,
  prevValidDateLabel: null
};

DatePicker.propTypes = {
  mode: PropTypes.oneOf(['date', 'datetime', 'time']),
  androidMode: PropTypes.oneOf(['clock', 'calendar', 'spinner', 'default']),
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date), PropTypes.object]),
  format: PropTypes.string,
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  height: PropTypes.number,
  duration: PropTypes.number,
  confirmBtnText: PropTypes.string,
  cancelBtnText: PropTypes.string,
  iconSource: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  iconComponent: PropTypes.element,
  customStyles: PropTypes.object,
  showIcon: PropTypes.bool,
  disabled: PropTypes.bool,
  allowFontScaling: PropTypes.bool,
  onDateChange: PropTypes.func,
  onOpenModal: PropTypes.func,
  onCloseModal: PropTypes.func,
  onPressMask: PropTypes.func,
  placeholder: PropTypes.string,
  modalOnResponderTerminationRequest: PropTypes.func,
  is24Hour: PropTypes.bool,
  getDateStr: PropTypes.func,
  locale: PropTypes.string,
  validate: PropTypes.func,
  invalidDateMessage: PropTypes.any,
  validDatesTitle: PropTypes.string,
  nextValidDateLabel: PropTypes.string,
  prevValidDateLabel: PropTypes.string
};

export default DatePicker;
